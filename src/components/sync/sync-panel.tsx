import { child, get, ref, remove, set } from "firebase/database";
import {
  DATABASE,
  RD_PROJECT_ITEMS,
  RD_PROJECT_USERS,
} from "../../../firebase";
import { Item, IUser } from "../../lib/types";
import { SEEDS } from "../../lib/seeds";
import useLocalStorage from "../../hooks/useLocalStorage";

type Props = {
  user: IUser;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
};

export default function SyncPanel({
  user,
  setLoading,
  setSuccess,
  setError,
}: Props) {
  const [items, setItems] = useLocalStorage<Item[]>("items", SEEDS);

  const deleteLocalUser = () => {
    localStorage.clear();
    window.location.reload();
  };

  // CREATE
  const uploadToDatabase = () => {
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      if (user) {
        set(ref(DATABASE, RD_PROJECT_ITEMS + user.name), { items }).then(() => {
          setLoading(false);
        });
        setSuccess("Выгружено");
      }
    } catch (error) {
      console.log(error);
      setError("Error. Try later");
    }
  };

  // DOWNLOAD
  const downloadFromDatabase = () => {
    if (confirm("Восстановить? Текущие данные будут удалены!") === true) {
      setSuccess("");
      setError("");
      setLoading(true);
      try {
        if (user) {
          const dbRef = ref(DATABASE);
          get(child(dbRef, `${RD_PROJECT_ITEMS}/${user.name}`))
            .then((snapshot) => {
              if (snapshot.exists()) {
                const result: {
                  items: Item[];
                } = snapshot.val();
                if (result.items) {
                  setItems(result.items);
                }
                setSuccess("Загружено");
                window.location.reload();
              } else {
                setError("No data available");
              }
              setLoading(false);
            })
            .catch((error) => {
              console.error(error);
              setError(error);
            });
        }
      } catch (error) {
        console.log(error);
        setError("Error. Try later");
      }
    }
  };

  const deleteUser = () => {
    setSuccess("");
    setError("");
    setLoading(true);
    if (user) {
      if (confirm(`Удалить?`) === true) {
        remove(ref(DATABASE, RD_PROJECT_ITEMS + user.name))
          .then(() => {
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error removing item:", error);
            setLoading(false);
            setError(error);
          });
        remove(ref(DATABASE, RD_PROJECT_USERS + user.name))
          .then(() => {
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error removing item:", error);
            setLoading(false);
            setError(error);
          });
        deleteLocalUser();
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <div className="mt-4 w-full flex flex-col justify-center gap-2">
      <div className="flex gap-3">
        <button
          onClick={deleteUser}
          className="btn whitespace-nowrap !bg-red-500"
        >
          Удалить все
        </button>

        <button onClick={deleteLocalUser} className="btn w-full">
          Выйти
        </button>
      </div>

      <button onClick={downloadFromDatabase} className="mt-4 btn w-full">
        Восстановить
      </button>

      <button onClick={uploadToDatabase} className="mt-4 btn w-full">
        Сделать резервную копию
      </button>
    </div>
  );
}
