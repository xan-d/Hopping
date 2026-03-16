// Example types for your wishlist app
export interface CreateItemDTO {
  title: string;
  url: string;
  price?: string;
  image?: string;
  notes?: string;
  board: string;
}

export interface UpdateItemDTO {
  title?: string;
  url?: string;
  price?: string;
  image?: string;
  notes?: string;
  board?: string;
  purchased?: boolean;
}

export interface ItemResponse {
  id: string;
  title: string;
  url: string;
  price?: string;
  image?: string;
  notes?: string;
  board: string;
  purchased: boolean;
  addedAt: Date;
  updatedAt: Date;
}

export interface BoardResponse {
  id: string;
  name: string;
  createdAt: Date;
}
