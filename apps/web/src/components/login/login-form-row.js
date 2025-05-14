"use client";
//documented
export default function FormRow ({ label, id, name, type="text"}) {
    return (
        // reusable label-input pair for login and signup forms
        <div className="flex items-center gap-4 mb-4">
            <label htmlFor={id} className="text-slate-200 text-xl w-40 whitespace-nowrap">{label}:</label>
            <input id={id} name={name} type={type} className="bg-white rounded-full px-6 py-2 flex-1" required></input>
        </div>
    );
}




