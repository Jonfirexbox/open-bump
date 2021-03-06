import {
  AfterCreate,
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { Transaction } from "sequelize/types";
import AssignedTier from "./AssignedTier";
import BumpData from "./BumpData";
import GuildFeature from "./GuildFeature";

@Table({
  tableName: "Guild"
})
export default class Guild extends Model<Guild> {
  // Discord Snowflake
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.STRING(20))
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING(20))
  feed!: string | null;

  @HasMany(() => GuildFeature)
  private features!: Array<GuildFeature>;

  @HasMany(() => AssignedTier)
  assignedTiers!: Array<AssignedTier>;

  @HasOne(() => BumpData)
  bumpData!: BumpData;

  @Column(DataType.STRING)
  prefix!: string | null;

  @Column(DataType.BOOLEAN)
  autobump!: boolean;

  @Column(DataType.STRING(20))
  lastBumpedBy!: string;

  @Column(DataType.DATE)
  lastBumpedAt?: Date | null;

  @Default(0)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  totalBumps!: number;

  @Column(DataType.BOOLEAN)
  nsfw!: boolean;

  @Column(DataType.BOOLEAN)
  hub!: boolean;

  public getFeatures() {
    const guildFeatures = this.features
      .filter(({ feature }) => Boolean(feature))
      .map(({ feature }) => feature);
    const tierFeatures = this.assignedTiers
      .map((tier) => tier.premiumTier.features.map(({ feature }) => feature))
      .reduce((previous, current) => [...previous, ...current], []);
    return [...guildFeatures, ...tierFeatures];
  }

  public isPremium() {
    return Boolean(this.assignedTiers?.length);
  }

  @AfterCreate
  public static async afterCreateHook(
    entity: Guild,
    { transaction }: { transaction?: Transaction }
  ) {
    const bumpData = await BumpData.create({ transaction });
    await entity.$set("bumpData", bumpData, { transaction });
  }
}

setTimeout(() => {
  Guild.addScope("default", {
    include: [
      {
        model: GuildFeature,
        as: "features",
        separate: true,
        limit: 3
      },
      {
        model: BumpData,
        as: "bumpData"
      },
      {
        model: AssignedTier.scope("default"),
        as: "assignedTiers"
      }
    ]
  });
}, 10);
