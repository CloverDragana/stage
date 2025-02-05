function CreatePost(){
    return(
        <div className="bg-white shadow-sm w-auto mx-6 my-3 items-center rounded-md shadow-2xl" >
            <div className="flex flex-row gap-8 px-4">
                <p className="text-xl">Username</p>
                <p>date post</p>
            </div>
            <hr className="mx-2 w-auto flex h-1 border-0 rounded-sm dark:bg-secondary"></hr>
            <p>hello</p>
            <hr className="mx-2 w-auto flex h-1 border-0 rounded-sm dark:bg-secondary"></hr>
            <div className="flex flex-row justify-between px-10">
                <p>Like</p>
                <p>Comment</p>
                <p>Share</p>
            </div>
        </div>
    );
}

export default CreatePost;