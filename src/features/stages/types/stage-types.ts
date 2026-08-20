/**
 * Refleja com.mundialpolla.stages.domain.StageType del backend.
 * No agregar valores que el backend no emita.
 */
export type StageTypeValue =
  | "GROUP_STAGE"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL"
  | "OTHER";

export type StageResponse = {
  id: string;
  tournamentId: string;
  externalId: number;
  name: string;
  type: StageTypeValue;
  orderNumber: number;
  active: boolean;
};
