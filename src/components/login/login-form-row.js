export default function FormRow ({ label, id, name}) {
    return (
        <div className="flex items-center gap-4 mb-4">
            <label htmlFor={id} className="text-slate-200 text-xl w-40 whitespace-nowrap">{label}:</label>
            <input id={id} name={name} className="bg-white rounded-full px-6 py-2 flex-1" required></input>
        </div>
    );
}