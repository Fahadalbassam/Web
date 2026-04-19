import type { ObjectId } from "mongodb";

/** Raw product document stored in MongoDB (`products` collection). */
export type ProductDoc = {
  _id?: ObjectId;
  slug: string;
  name: string;
  brand: string;
  partNumber: string;
  price: number;
  /** Image URL or site-relative path stored in DB (assignment: filename/path). */
  image: string;
  category: string;
  description: string;
  stockQty: number;
  compatibility: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};
