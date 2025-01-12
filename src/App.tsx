import { useRef, useState } from "react";
import ThemeToggle from "./components/ThemeToggle";
import {
  BackspaceIcon,
  DeleteIcon,
  DownIcon,
  MeasurementsIcon,
  NetworkOffIcon,
  NetworkOnIcon,
  PlusIcon,
  StarIcon,
} from "./components/icons";
import useLocalStorage from "./hooks/useLocalStorage";
import { IDay, Item } from "./lib/types";
import { SEEDS } from "./lib/seeds";
import { v4 as uuidv4 } from "uuid";
import Modal from "./components/modal";
import ListItem from "./components/list-item";
import Sync from "./components/sync/sync";
import useCheckConnection from "./hooks/useCheckConnection";

export default function App() {
  const date = new Date();
  const today = date.getDate();

  const inputRef = useRef<HTMLInputElement>(null);

  const isOnline = useCheckConnection();

  const [items, setItems] = useLocalStorage<Item[]>("items", SEEDS);
  const [lastPage, setLastPage] = useLocalStorage("lastPage", 1);
  const [userMeasurements, setUserMeasurements] = useLocalStorage<{
    weight: string;
    age: string;
  }>("userMeasurements", { weight: "80", age: "37" });

  const [selectedDay, setSelectedDay] = useState(lastPage);

  const [day, setDay] = useLocalStorage<IDay>("day", {
    productsToEat: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [isItemWeightOpen, setIsItemWeightOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isUserMeasurementsOpen, setIsUserMeasurementsOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
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

      setDay((prevDay) => ({
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
      setDay((prevDay) => ({
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
    setDay((prevDay) => ({
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
    day.productsToEat.filter((el) => el.day === selectedDay)
  );
  const target =
    88 +
    13 * Number(userMeasurements.weight) +
    4.2 * 178 -
    5.7 * Number(userMeasurements.age);
  const remainingCalories = Math.round(target - totalCalories);

  const cleanDay = () =>
    setDay({
      productsToEat: day.productsToEat.filter((el) => el.day !== selectedDay),
    });

  const addNewProduct = () => {
    setIsItemsOpen(false);
    setIsAddItemOpen(true);
  };

  const editProduct = () => {
    setIsItemWeightOpen(false);
    setIsEditItemOpen(true);
  };

  const handleAddItem = (newItem: Item) => {
    setItems((prev) => [...prev, newItem]);
    setSearchQuery(newItem.title);
  };

  const handleUpdateItem = (updatedItem: Item) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setIsItemsOpen(true);
  };

  const handleDeleteItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const handleUserMeasurementsChange = (
    field: keyof typeof userMeasurements,
    value: string
  ) => {
    setUserMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const toggleUserMeasurements = () =>
    setIsUserMeasurementsOpen((prev) => !prev);

  return (
    <>
      {/* Выбор продукта */}
      <Modal
        isOpen={isItemsOpen}
        onClose={() => setIsItemsOpen(false)}
        content={
          <div className="p-2">
            <div className="rounded-xl max-h-[399px] overflow-y-auto">
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
                    className="list-modal"
                  >
                    <span className="w-full flex items-center gap-3">
                      {item.title}
                      {item.isFavorite && <StarIcon active />}
                    </span>
                    <span>{item.calories}</span>
                  </div>
                ))}
            </div>

            <button onClick={addNewProduct} className="btn-small ml-2 mt-4">
              Новый продукт
            </button>

            <div className="mt-1 p-2 flex gap-3">
              <div className="relative w-full">
                <input
                  type="text"
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="pl-5 pr-12"
                />

                <button
                  onClick={() => {
                    if (searchQuery.length > 0) {
                      setSearchQuery("");
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    } else {
                      setIsItemsOpen(false);
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 dark:text-app-dark-3 w-11 h-11 rounded-full flex items-center justify-center"
                >
                  {searchQuery.length > 0 ? <BackspaceIcon /> : <DownIcon />}
                </button>
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

      {/* Выбор веса */}
      <Modal
        isOpen={isItemWeightOpen}
        onClose={() => {
          setIsItemWeightOpen(false);
          setProductWeight("");
        }}
        content={
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h2>{selectedItem?.title}</h2>
              <button
                onClick={editProduct}
                className="btn-small dark:!bg-app-light/30 !bg-app-light !text-app-accent-2 dark:!text-app-light/70"
              >
                Изменить
              </button>
            </div>

            <div className="mt-4 flex gap-3">
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

      {/* Правка */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        content={
          <div className="p-4">
            <h2>{selectedProduct?.product.title}</h2>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleDeleteProduct(selectedProduct!.id)}
                className="btn-rounded dark:text-app-accent-1"
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
          </div>
        }
      />

      <Modal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        content={
          <ListItem
            onComplete={() => {
              setIsAddItemOpen(false);
              setIsItemsOpen(true);
            }}
            onAddItem={handleAddItem}
          />
        }
      />

      <Modal
        isOpen={isEditItemOpen}
        onClose={() => setIsEditItemOpen(false)}
        content={
          <ListItem
            item={selectedItem}
            onComplete={() => setIsEditItemOpen(false)}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        }
      />

      <Modal
        isOpen={isUserMeasurementsOpen}
        onClose={toggleUserMeasurements}
        content={
          <div className="p-4">
            <h2>Введите возраст и вес</h2>

            <div className="mt-4 w-full flex gap-4">
              <input
                type="number"
                value={userMeasurements.age}
                onChange={(e) =>
                  handleUserMeasurementsChange("age", e.target.value)
                }
                placeholder="Возраст (лет)"
                className="number_input"
              />
              <input
                type="number"
                value={userMeasurements.weight}
                onChange={(e) =>
                  handleUserMeasurementsChange("weight", e.target.value)
                }
                placeholder="Вес (кг)"
                className="number_input !w-full"
                autoFocus
              />

              <button
                onClick={toggleUserMeasurements}
                disabled={!userMeasurements.weight || !userMeasurements.age}
                className="btn "
              >
                Сохранить
              </button>
            </div>
          </div>
        }
      />

      <Modal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        content={<Sync />}
      />

      <main className="max-w-md mx-auto">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUserMeasurementsOpen(true)}
              className="btn-rounded !bg-neutral-50 dark:!bg-white/15"
            >
              <MeasurementsIcon />
            </button>
            <button
              onClick={() => setIsSyncOpen(true)}
              className="btn-rounded !bg-neutral-50 dark:!bg-white/15"
            >
              {isOnline ? <NetworkOnIcon /> : <NetworkOffIcon />}
            </button>

            <ThemeToggle />

            <button
              onClick={cleanDay}
              className="btn ml-auto !bg-neutral-50 !text-app-dark-1 dark:!text-app-accent-1 dark:!bg-app-accent-2"
            >
              Очистить
            </button>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-neutral-500">
              {`${totalCalories.toFixed(0)} / ${target.toFixed(0)}`} ккал
            </p>
            <p className="text-neutral-500">
              {remainingCalories > 0 ? "Осталось " : "Превышено "}
              <span
                className={`font-bold text-lg ${
                  remainingCalories > 0
                    ? "dark:text-app-accent-1"
                    : "text-red-500"
                }`}
              >
                {remainingCalories}
              </span>
            </p>
          </div>
        </div>

        {day.productsToEat
          .filter((el) => el.day === selectedDay)
          .map((item) => (
            <div
              key={item.id}
              onClick={() => handleEditProduct(item)}
              className="list"
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

        <footer className="fixed bottom-0 inset-x-0 h-16 bg-neutral-50 dark:bg-app-dark-1 font-medium">
          <div className="h-full max-w-md mx-auto flex items-center justify-around text-xl">
            <button
              onClick={() => {
                setSelectedDay(1);
                setLastPage(1);
              }}
              className="w-full h-full"
            >
              <span
                className={`${
                  selectedDay === 1
                    ? "bg-app-accent-2 text-app-accent-1"
                    : "dark:text-app-light"
                } rounded-full px-4 py-1 transition-all`}
              >
                {today % 2 !== 0 ? "Сегодня" : "Завтра"}
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedDay(2);
                setLastPage(2);
              }}
              className="w-full h-full"
            >
              <span
                className={`${
                  selectedDay === 2
                    ? "bg-app-accent-2 text-app-accent-1"
                    : "dark:text-app-light"
                } rounded-full px-4 py-1 transition-all`}
              >
                {today % 2 === 0 ? "Сегодня" : "Завтра"}
              </span>
            </button>
          </div>
        </footer>
      </main>
    </>
  );
}
