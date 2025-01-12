export interface Item {
  id: string;
  title: string;
  calories: string;
  isFavorite?: boolean;
}

type ProductToEat = {
  id: string;
  day: number;
  product: Item;
  weight: string;
};

export interface IDay {
  productsToEat: ProductToEat[];
}

export interface IUser {
  name: string;
  password: string;
}
