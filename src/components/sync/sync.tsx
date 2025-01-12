import { useState } from "react";
import { IUser } from "../../lib/types";
import UserForm from "./user-form";
import SyncPanel from "./sync-panel";
import useLocalStorage from "../../hooks/useLocalStorage";

export default function Sync() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [user, saveUser] = useLocalStorage<IUser | null>("user", null);
  const [userForm, setUserForm] = useState(false);

  return (
    <div className="p-4">
      <h2>{user ? user.name : "Нет пользователя"}</h2>

      {user ? (
        <SyncPanel
          user={user}
          setLoading={setLoading}
          setSuccess={setSuccess}
          setError={setError}
        />
      ) : (
        <>
          {userForm ? (
            <UserForm
              saveUser={saveUser}
              setLoading={setLoading}
              setSuccess={setSuccess}
              setError={setError}
            />
          ) : (
            <>
              <button
                onClick={() => setUserForm(true)}
                className="mt-4 btn w-full"
              >
                Войти
              </button>
            </>
          )}
        </>
      )}
      {loading && <div className="mt-4">Loading...</div>}

      {success && <div className="mt-4">{success}</div>}

      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
}
