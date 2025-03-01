"use client";

function PersonalTags() {

    const tags = [
        { title: 'Painter'},
        { title: 'Illustrator'},
        { title: 'Abstract'},
        { title: 'Sculpture'},
        { title: 'Tag 5'}
    ];
    return(
        <div className="flex flex-row gap-2">
            {tags.map((field) => (
                <span key={field.title} className=" bg-[rgb(217,217,217)] rounded-xl px-4 p-2 text-black text-center font-bold text-sm w-fit">
                    {field.title}
                </span>
            ))}
        </div>
    );
}

export default PersonalTags;