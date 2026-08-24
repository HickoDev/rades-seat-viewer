export type SeatMetadata = {
  id: string;
  sectionId: string;
  tierId: string;
  rowNumber: number;
  seatNumber: number;
  position: [number, number, number];
  rotationY: number;
};

export type SeatLayout = {
  metadata: SeatMetadata[];
  matrices: Float32Array;
};
