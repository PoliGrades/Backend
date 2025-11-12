export interface IMessage {
  room_id: string;
  sender_id: number;
  sender_role: "STUDENT" | "PROFESSOR";
  sender_name: string;
  message: string;
  timestamp: Date;
}
