import { ColDef, GridOptions, RowNode } from '@ag-grid-community/core';
import { AdaptableApi } from '@adaptabletools/adaptable/src/Api/AdaptableApi';

const DEFAULT_CONFIG: Required<DataGeneratorConfig> = {
  initialTradesNumber: 400,
  tradeCounterStart: 11234,
  maxUnitPricePercentageDeviation: 10,
  enableMarketPriceVariation: true,
  maxMarketPricePercentageVariation: 5,
  forcedMarketPricePercentageVariation: 10,
  forceMarketPricePercentageVariationSequence: 100,
  marketPriceVariationIntervalInSeconds: 3,
  enableContinuousTradeGeneration: true,
  tradeGenerationIntervalInSeconds: 120,
};

export class TradeDataGenerator {
  private readonly config: Required<DataGeneratorConfig>;

  private state = {
    currentCounter: 0,
  };

  private constructor(private adaptableApi: AdaptableApi, customConfig?: DataGeneratorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };

    this.state.currentCounter = this.config.tradeCounterStart;
  }

  static initialize(
    adaptableApi: AdaptableApi,
    customConfig?: DataGeneratorConfig
  ): TradeDataGenerator {
    const generator = new TradeDataGenerator(adaptableApi, customConfig);

    const gridOptions = adaptableApi.internalApi.getAgGridInstance() as GridOptions;
    gridOptions.context = gridOptions.context ?? {};
    gridOptions.context.tradeGenerator = generator;

    const { config } = generator;

    // generate initial data
    if (config.initialTradesNumber > 0) {
      const initialTrades = generator.generateTrades(config.initialTradesNumber);
      adaptableApi.gridApi.setGridData(initialTrades);
    }

    // generate new trade on a given interval
    if (config.enableContinuousTradeGeneration && config.tradeGenerationIntervalInSeconds > 0) {
      // generate the first trade after a few seconds, so the user sees something early on
      setTimeout(() => {
        const newTrade = generator.generateTrade({ tradeDateToday: true });
        adaptableApi.gridApi.addGridData([newTrade], { addIndex: 0 });
      }, 5000);

      setInterval(() => {
        const newTrade = generator.generateTrade({ tradeDateToday: true });
        adaptableApi.gridApi.addGridData([newTrade], { addIndex: 0 });
      }, config.tradeGenerationIntervalInSeconds * 1000);
    }

    // update market price on a given interval
    if (config.enableMarketPriceVariation) {
      setInterval(() => {
        const forceMarketPriceVariation =
          generator.getCurrentTradeCounter() %
            config.forceMarketPricePercentageVariationSequence ===
          0;

        generator.updateMarketPriceOnRandomInstrument({
          forceMarketPriceVariation,
        });
      }, config.marketPriceVariationIntervalInSeconds * 1000);
    }

    return generator;
  }

  public static getAvailableTickers(): string[] {
    return Object.keys(INSTRUMENT_DATA);
  }

  public static getAvailableUsers(): UserInfo[] {
    return TRADERS_DATA;
  }

  generateTrade(config?: { tradeDateToday?: boolean }): Trade {
    const counter = this.state.currentCounter + 1;

    const instrument = this.pickRandomInstrument();
    const tradeDate = config?.tradeDateToday ? new Date() : this.getRandomDate(-50, -1);
    const settlementDate = this.addDays(tradeDate, this.getRandomInt(25, 40));
    const direction = this.getRandomBoolean() ? 'Buy' : 'Sell';
    const marketPrice = instrument.marketPrice;

    const unitPriceDeltaValue =
      (marketPrice * this.getRandomInt(1, this.config.maxUnitPricePercentageDeviation)) / 100;
    const unitPrice = this.getRandomBoolean()
      ? marketPrice - unitPriceDeltaValue
      : marketPrice + unitPriceDeltaValue;

    const status = config?.tradeDateToday ? 'In Progress' : this.getTradeStatus(settlementDate);

    const tradeItem: Trade = {
      tradeId: `${counter}-${instrument.ticker}-${direction === 'Buy' ? 'B' : 'S'}`,
      user: this.pickRandomElement(this.getTraderData()),
      book: this.pickRandomElement(this.getBookData()),
      clientName: this.pickRandomElement(this.getCounterpartyData()),
      tradeDate,
      settlementDate,
      direction,
      status,
      ticker: instrument.ticker,
      cusip: instrument.cusip,
      instrument: instrument.instrument,
      currency: this.pickRandomElement(this.getCurrencyData()),
      quantity: this.getRandomInt(2, 5),
      unitPrice,
      marketPrice,

      commission: this.getMeaningfulDoubleInRange(0.1, 0.35),
      fees: this.getMeaningfulDoubleInRange(5, 30),
      rating: this.pickRandomElement(this.getMoodysRatingData()),

      fill: status === 'Completed' ? 100 : this.getRandomInt(8, 95),
    };

    // update the state
    this.state.currentCounter = counter;

    return tradeItem;
  }

  getCurrentTradeCounter() {
    return this.state.currentCounter;
  }

  private generateTrades(size: number): Trade[] {
    const generatedData: Trade[] = [];
    for (let count = 1; count <= size; count++) {
      generatedData.push(this.generateTrade());
    }

    return generatedData.reverse();
  }

  public updateMarketPriceOnRandomInstrument(conf?: {
    forceMarketPriceVariation?: boolean;
  }): InstrumentInfo {
    const instrument = this.pickRandomInstrument();

    const marketPriceVariation = conf?.forceMarketPriceVariation
      ? this.config.forcedMarketPricePercentageVariation
      : this.getRandomInt(1, this.config.maxMarketPricePercentageVariation);

    const marketPriceDeltaValue = (instrument.marketPrice * marketPriceVariation) / 100;
    const newMarketPrice = this.getRandomBoolean()
      ? instrument.marketPrice - marketPriceDeltaValue
      : instrument.marketPrice + marketPriceDeltaValue;

    const oldMarketPriceValue = INSTRUMENT_DATA[instrument.ticker].marketPrice;
    INSTRUMENT_DATA[instrument.ticker].marketPrice = newMarketPrice;

    const updatedInstrument = this.getInstrumentData().find(
      (instrumentInfo) => instrumentInfo.ticker === instrument.ticker
    ) as InstrumentInfo;

    // update all grid rows which reference the updated instrument
    const relevantRowNodes: RowNode<Trade>[] = this.adaptableApi.gridApi.getAllRowNodes({
      filterFn: (rowNode: RowNode<Trade>) => rowNode.data?.ticker === updatedInstrument.ticker,
    });
    const updatedRowData = relevantRowNodes.map((rowNode) => ({
      ...rowNode.data,
      marketPrice: updatedInstrument.marketPrice,
    }));

    this.adaptableApi.gridApi.updateGridData(updatedRowData, { runAsync: true });

    // AFL: not very nice, but currently there is no way to trigger a single alert for multiple changed cells
    if (conf?.forceMarketPriceVariation && updatedRowData.length) {
      const message = `Market Price for ${instrument.ticker} has a  10% change, from ${oldMarketPriceValue} to ${newMarketPrice}`;
      this.adaptableApi.alertApi.showAlertWarning(
        `${instrument.ticker} -  Significant Market Price Change!`,
        message
      );
    }

    return updatedInstrument;
  }

  private pickRandomInstrument(): InstrumentInfo {
    return this.cloneObject(this.pickRandomElement(this.getInstrumentData()));
  }

  private getTradeStatus(settlementDate: Date): TradeStatus {
    if (settlementDate < new Date()) {
      return 'Completed';
    }

    const randomNumber = this.getRandomInt(1, 7);
    if (randomNumber === 1) {
      return 'Rejected';
    }
    return 'In Progress';
  }

  private getInstrumentData(): readonly InstrumentInfo[] {
    return Object.values(INSTRUMENT_DATA);
  }

  private getTraderData(): readonly UserInfo[] {
    return TRADERS_DATA;
  }

  private getBookData(): readonly string[] {
    return BOOKS_DATA;
  }

  private getCounterpartyData(): readonly string[] {
    return COUNTERPARTY_DATA;
  }

  private getCurrencyData(): readonly string[] {
    return CURRENCT_DATA;
  }

  private getMoodysRatingData(): readonly string[] {
    return MOODYS_RATINGS;
  }

  private pickRandomElement<T>(collection: readonly T[], max?: number): T {
    if (max) {
      return collection[this.getRandomPositiveInt(Math.min(max, collection.length - 1))];
    }
    return collection[this.getRandomPositiveInt(collection.length - 1)];
  }

  private getRandomPositiveInt(maxValue: number): number {
    return this.getRandomInt(0, maxValue);
  }

  private getRandomInt(minValue: number, maxValue: number): number {
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
  }

  private getRandomDate(minDays: number, maxDays: number): Date {
    const date = this.getRandomDateAndTime(minDays, maxDays);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getRandomDateAndTime(minDays: number, maxDays: number): Date {
    const currentDate = new Date(); // Fix it
    const start = this.addDays(currentDate, minDays);
    const end = this.addDays(currentDate, maxDays);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private addDays(date: Date, days: number): Date {
    if (typeof date.getMonth !== 'function') {
      return date;
    }
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private getRandomBoolean(): boolean {
    const amount = this.getRandomInt(0, 1);
    return amount === 0;
  }

  // [0, 1)
  private generateRandomDouble(): number {
    return Math.random();
  }

  private roundTo4Decimals(val: number): number {
    return Math.round(val * 10000) / 10000;
  }

  private getMeaningfulDoubleInRange(min: number, max: number): number {
    return this.roundTo4Decimals(this.getRandomInt(min, max) + this.generateRandomDouble());
  }

  private cloneObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

const INSTRUMENT_DATA: Record<string, InstrumentInfo> = {
  AAPL: {
    instrument: 'Apple Inc.',
    ticker: 'AAPL',
    cusip: '37833100',
    marketPrice: 145.3,
  },
  ABBV: {
    instrument: 'AbbVie Inc.',
    ticker: 'ABBV',
    cusip: '00287Y109',
    marketPrice: 140.29,
  },
  ACN: {
    instrument: 'Accenture plc',
    ticker: 'ACN',
    cusip: 'G1151C101',
    marketPrice: 269.7,
  },
  AMZN: {
    instrument: 'Amazon.com',
    ticker: 'AMZN',
    cusip: '23135106',
    marketPrice: 120.3,
  },
  BA: {
    instrument: 'Boeing Co.',
    ticker: 'BA',
    cusip: '97023105',
    marketPrice: 132.2,
  },
  BAC: {
    instrument: 'Bank of America Corp',
    ticker: 'BAC',
    cusip: '60505104',
    marketPrice: 31.46,
  },
  CSCO: {
    instrument: 'Cisco Systems',
    ticker: 'CSCO',
    cusip: '17275R102',
    marketPrice: 41.52,
  },
  FB: {
    instrument: 'Facebook',
    ticker: 'FB',
    cusip: '30303M102',
    marketPrice: 139.07,
  },
  GM: {
    instrument: 'General Motors',
    ticker: 'GM',
    cusip: '37045V100',
    marketPrice: 34.63,
  },
  GOOG: {
    instrument: 'Alphabet Inc',
    ticker: 'GOOG',
    cusip: '02079K107',
    marketPrice: 102.24,
  },
  INTC: {
    instrument: 'Intel Corporation',
    ticker: 'INTC',
    cusip: '458140100',
    marketPrice: 27.8,
  },
  MSFT: {
    instrument: 'Microsoft',
    ticker: 'MSFT',
    cusip: '594918104',
    marketPrice: 246.79,
  },
  NKE: {
    instrument: 'Nike',
    ticker: 'NKE',
    cusip: '654106103',
    marketPrice: 90.17,
  },
  ORCL: {
    instrument: 'Oracle Corporation',
    ticker: 'ORCL',
    cusip: '68389X105',
    marketPrice: 65.3,
  },
};

export const CURRENT_USER = 'AdapTable Demo User';

const TRADERS_DATA: UserInfo[] = [
  {
    name: 'Nick Kolba',
    email: 'nkolba@gmail.com',
  },
  {
    name: 'Rob Moffat',
    email: 'rob.moffat@hsbc.com',
  },
  {
    name: `Seb Ben M'Barek`,
    email: 'sebastien.benmbarek@normanandsons.com',
  },
];

const BOOKS_DATA = ['A1', 'A2', 'A3', 'B1', 'B2', 'B2', 'B3'];

const COUNTERPARTY_DATA = [
  'Goldman Sachs',
  'Soc Gen',
  'BAML',
  'Nat West Markets',
  'Barclays',
  'Citi',
  'JP Morgan',
  'Morgan Stanley',
  'BNP',
  'UBS',
  'Credit Suisse',
  'Nomura',
];

const CURRENCT_DATA = ['EUR', 'USD', 'GBP'];

const MOODYS_RATINGS = [
  'Aaa',
  'Aa1',
  'Aa2',
  'Aa3',
  'A1',
  'A2',
  'A3',
  'Baa1',
  'Baa2',
  'Baa3',
  'Ba1',
  'Ba2',
  'Ba3',
  'B1',
  'B2',
  'B3',
  'Caa',
  'Ca',
  'C',
  'WR',
  'NR',
];

export interface DataGeneratorConfig {
  /**
   * The size of the iintially generated trade data
   */
  initialTradesNumber?: number;

  /**
   * Trade ID start number
   */
  tradeCounterStart?: number;
  /**
   * Difference in percentage points against marketPrice
   */
  maxUnitPricePercentageDeviation?: number;
  /**
   * Whether market prices should be updated in real time
   */
  enableMarketPriceVariation?: boolean;
  /**
   * Difference in percentage points against previous marketPrice
   */
  maxMarketPricePercentageVariation?: number;
  /**
   * Interval in SECONDS for market price variation
   */
  marketPriceVariationIntervalInSeconds?: number;
  /**
   * Forced market price variation in percentage points
   */
  forcedMarketPricePercentageVariation?: number;
  /**
   * Force market price variation every given X updates
   */
  forceMarketPricePercentageVariationSequence: number;
  /**
   * Whether new trades should be generated every `continuousTradeGenerationInterval` seconds
   */
  enableContinuousTradeGeneration?: boolean;
  /**
   * Interval in SECONDS for new trade generation
   */
  tradeGenerationIntervalInSeconds?: number;
}

export interface Trade {
  tradeId: string;
  user: UserInfo;
  book: string;
  clientName: string;
  tradeDate: Date;
  settlementDate: Date;
  direction: TradeDirection;
  status: TradeStatus;
  ticker: string;
  cusip: string;
  instrument: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  commission: number;
  fees: number;
  rating: string;
  marketPrice: number;
  fill: number;
}

export type TradeStatus = 'Completed' | 'Rejected' | 'In Progress';
export type TradeDirection = 'Buy' | 'Sell';

export interface InstrumentInfo {
  instrument: string;
  ticker: string;
  cusip: string;
  marketPrice: number;
}

export interface UserInfo {
  name: string;
  email: string;
}
