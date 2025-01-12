import { useState } from "react";
import ThemeToggle from "./components/ThemeToggle";
import { DeleteIcon, PlusIcon, StarIcon } from "./components/icons";
import useLocalStorage from "./hooks/useLocalStorage";
import { IDay, Item } from "./lib/types";
import { SEEDS } from "./lib/seeds";
import { v4 as uuidv4 } from "uuid";
import Modal from "./components/modal";

export default function App() {
  const date = new Date();
  const day = date.getDate();

  const [items] = useLocalStorage<Item[]>("items", SEEDS);
  const [userMeasurements] = useLocalStorage<{
    weight: string;
    age: string;
  }>("userMeasurements", { weight: "80", age: "37" });

  const [selectedDay, setSelectedDay] = useState(1);

  const [day_1, setDay_1] = useLocalStorage<IDay>("day_1", {
    productsToEat: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [isItemWeightOpen, setIsItemWeightOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    product: Item;
    weight: string;
  } | null>(null);
  const [productWeight, setProductWeight] = useState("");

  const toggleItemWeight = (item?: Item) => {
    setSelectedItem(item);
    setIsItemsOpen(false);
    setIsItemWeightOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedItem && productWeight) {
      const newProduct = {
        id: uuidv4(),
        day: selectedDay,
        product: selectedItem,
        weight: productWeight,
      };

      setDay_1((prevDay) => ({
        ...prevDay,
        productsToEat: [...prevDay.productsToEat, newProduct],
      }));

      setProductWeight("");
      setSearchQuery("");
      setShowFavorites(false);
      setIsItemWeightOpen(false);
    }
  };

  const handleEditProduct = (product: {
    id: string;
    product: Item;
    weight: string;
  }) => {
    setSelectedProduct(product);
    setProductWeight(product.weight);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = () => {
    if (selectedProduct && productWeight) {
      setDay_1((prevDay) => ({
        ...prevDay,
        productsToEat: prevDay.productsToEat.map((item) =>
          item.id === selectedProduct.id
            ? { ...item, weight: productWeight }
            : item
        ),
      }));
      setIsEditModalOpen(false);
      setProductWeight("");
    }
  };

  const handleDeleteProduct = (id: string) => {
    setDay_1((prevDay) => ({
      ...prevDay,
      productsToEat: prevDay.productsToEat.filter((item) => item.id !== id),
    }));
    setIsEditModalOpen(false);
  };

  const calculateTotalCalories = (
    productsToEat: { product: Item; weight: string }[]
  ) => {
    return productsToEat.reduce((total, item) => {
      const calories =
        (Number(item.weight) / 100) * Number(item.product.calories);
      return total + calories;
    }, 0);
  };

  const totalCalories = calculateTotalCalories(
    day_1.productsToEat.filter((el) => el.day === selectedDay)
  );
  const target =
    88 +
    13 * Number(userMeasurements.weight) +
    4.2 * 178 -
    5.7 * Number(userMeasurements.age);
  const remainingCalories = Math.round(target - totalCalories);

  const cleanDay_1 = () =>
    setDay_1({
      productsToEat: day_1.productsToEat.filter((el) => el.day !== selectedDay),
    });

  return (
    <>
      <Modal
        isOpen={isItemsOpen}
        onClose={() => setIsItemsOpen(false)}
        content={
          <div className="p-2">
            <div className="rounded-lg max-h-[399px] overflow-y-auto">
              {items
                .filter((item) =>
                  item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .filter((item) => (showFavorites ? item.isFavorite : true))
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((item) => (
                  <div
                    onClick={() => toggleItemWeight(item)}
                    key={item.id}
                    className="list"
                  >
                    <span className="w-full flex items-center gap-3">
                      {item.title}
                      {item.isFavorite && <StarIcon active />}
                    </span>
                    <span>{item.calories}</span>
                  </div>
                ))}
            </div>

            <div className="mt-2 p-2 flex gap-3">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию"
                  className="pl-5 pr-12"
                />
                {searchQuery.length > 2 && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-red-400 rotate-45 w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    <PlusIcon />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFavorites((prev) => !prev)}
                className="btn-rounded"
              >
                <StarIcon active={showFavorites} />
              </button>
            </div>
          </div>
        }
      />

      <Modal
        isOpen={isItemWeightOpen}
        onClose={() => {
          setIsItemWeightOpen(false);
          setProductWeight("");
        }}
        content={
          <form onSubmit={handleSubmit}>
            <h2>{selectedItem?.title}</h2>

            <div className="flex gap-3">
              <input
                value={productWeight}
                onChange={(e) => setProductWeight(e.target.value)}
                placeholder="Вес"
                type="number"
                autoComplete="off"
                spellCheck="false"
                className="number_input"
                autoFocus
              />
              <button
                type="submit"
                disabled={!productWeight}
                className="btn w-full"
              >
                Добавить
              </button>
            </div>
          </form>
        }
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        content={
          <>
            <h2>{selectedProduct?.product.title}</h2>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleDeleteProduct(selectedProduct!.id)}
                className="btn-rounded !text-red-500"
              >
                <DeleteIcon />
              </button>

              <input
                value={productWeight}
                onChange={(e) => setProductWeight(e.target.value)}
                placeholder="Вес"
                type="number"
                className="number_input"
                autoComplete="off"
                spellCheck="false"
                autoFocus
              />

              <button
                onClick={handleUpdateProduct}
                disabled={!productWeight}
                className="btn w-full"
              >
                Обновить
              </button>
            </div>
          </>
        }
      />

      <main className="max-w-md mx-auto">
        <ThemeToggle />

        <div className="flex gap-3 pb-4">
          <button
            onClick={cleanDay_1}
            className="btn !bg-transparent !h-10 border !text-neutral-600"
          >
            Очистить
          </button>

          <div className="ml-auto flex flex-col">
            <p className="text-neutral-700 text-right leading-4">
              {`${totalCalories.toFixed(0)} / ${target.toFixed(0)}`} ккал
            </p>
            <p className="text-neutral-900 text-right">
              {remainingCalories > 0 ? "Осталось " : "Превышено "}
              <span
                className={`font-bold text-lg ${
                  remainingCalories > 0 ? "text-blue-500" : "text-red-500"
                }`}
              >
                {remainingCalories}
              </span>
            </p>
          </div>
        </div>

        {day_1.productsToEat
          .filter((el) => el.day === selectedDay)
          .map((item) => (
            <div
              key={item.id}
              onClick={() => handleEditProduct(item)}
              className="-mx-4 list"
            >
              <p className="w-full">{item.product.title}</p>
              <div className="flex gap-3">
                <span className="w-12 text-right whitespace-nowrap text-neutral-500">
                  {item.weight} г.
                </span>
                <span className="w-12 text-right whitespace-nowrap">
                  {(
                    (Number(item.weight) / 100) *
                    Number(item.product.calories)
                  ).toFixed(0)}
                </span>
              </div>
            </div>
          ))}

        <button
          onClick={() => setIsItemsOpen(true)}
          className="fixed bottom-20 right-4 bg-app-accent-2 text-app-accent-1 w-14 h-14 flex items-center justify-center rounded-full"
        >
          <PlusIcon />
        </button>

        <footer className="fixed bottom-0 inset-x-0 h-16 bg-app-dark-1">
          <div className="h-full max-w-md mx-auto flex items-center justify-around text-xl">
            <button
              onClick={() => setSelectedDay(1)}
              className={`${
                selectedDay === 1
                  ? "bg-app-accent-2 text-app-accent-1"
                  : "text-app-light"
              } rounded-full px-4 py-1 transition-all`}
            >
              {day % 2 !== 0 ? "Сегодня" : "Завтра"}
            </button>
            <button
              onClick={() => setSelectedDay(2)}
              className={`${
                selectedDay === 2
                  ? "bg-app-accent-2 text-app-accent-1"
                  : "text-app-light"
              } rounded-full px-4 py-1 transition-all`}
            >
              {day % 2 === 0 ? "Сегодня" : "Завтра"}
            </button>
          </div>
        </footer>
      </main>
    </>
  );
}
