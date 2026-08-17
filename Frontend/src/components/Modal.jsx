import React, { useContext } from "react";
import { X } from "lucide-react";
import { LoginContext } from "../context/LoginContext";
import { useNavigate } from "react-router-dom";



export default function Modal() {

  const { setmodalOpen, logout } = useContext(LoginContext);
  const navigate = useNavigate()
  return (
    <div onClick={()=>{setmodalOpen(false)}} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white w-[90%] max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 relative">

        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold">Confirm</h5>

          <button onClick={()=>{setmodalOpen(false)}} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Are you sure you want to log out?
        </p>

        <div className="flex justify-end gap-3">
          <button  onClick={()=>{setmodalOpen(false)}} className="px-4 py-2 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm transition cursor-pointer">
            Cancel
          </button>

          <button onClick={()=>{
            logout();
            navigate("/Signin");
            }}
             className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition cursor-pointer">
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}
