import StarWork from "@/components/profile/star-work";

function ContentDisplay() {
    const ContentTitles = [
        { title: 'Profile'},
        { title: 'Collections'},
        { title: 'Interactions'},
        { title: 'Network'}
    ];

    return(
        <div className=" w-full">
            <ul className="flex flex-row">
                {ContentTitles.map((name) => (
                    <li key={name.title} className="w-full flex justify-center hover-shadow-custom hover:text-black">
                        <button href={name.href} className="block px-2 py-3">
                            {name.title}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="w-full">
                <StarWork />
            </div>
        </div>
    );
}

export default ContentDisplay;