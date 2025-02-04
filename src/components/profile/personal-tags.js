function PersonalTags() {

    const tags = [
        { title: 'Tag 1'},
        { title: 'Tag 2'},
        { title: 'Tag 3'},
        { title: 'Tag 4'},
        { title: 'Tag 5'}
    ];
    return(
        <ul className="flex flex-col gap-2 w-full">
            {tags.map((field) => (
                <li key={field.title} className=" bg-secondary rounded-full w-40 p-2 text-white text-center font-bold">
                    {field.title}
                </li>
            ))}
        </ul>
    );
}

export default PersonalTags;