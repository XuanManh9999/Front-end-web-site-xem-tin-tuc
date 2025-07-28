import { IRole } from "./role";

export interface IUser {
  id: number;
  username: string;
  point: number | null;
  phoneNumber: string | null;
  gender: string | null;
  email: string | null;
  birthday: string | null;
  background: string | null;
  avatar: string | null;
  active: string;
  createdAt: string;
  updatedAt: string;
  roles: IRole[];
}
