"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/outline";

function CreatePortfolio({onClose}) {
    const { data: session } = useSession();
    const inputFileRef = useRef(null);

    const [portfolioTitle, setPortfolioTitle] = useState("");
    const [portfolioDescription, setPortfolioDescription] = useState("");
    const [portfolioContent, setPortfolioContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    // opens the systems file browser for the user when the image button is clicked
    //documented
    const handleAddImageClick = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        } 
    };

    //documented
    const handleAddImage = (event) => {
        // check to see if files were selected
        if(event.target.files && event.target.files[0]){
            // get the first selected file
            const selectedFile = event.target.files[0];
            const fileReader = new FileReader();

            fileReader.onload = () => {

                //store the read file in a variable for previewing
                const base64Image = fileReader.result;
                // create a new object in the array
                setPortfolioContent([
                    ...portfolioContent,{
                    type: "image",
                    preview: base64Image,
                    file: selectedFile,
                    id: Date.now(),
                    }
                ]);

                // reset the value in the hidden file input 
                if (inputFileRef.current) {
                    inputFileRef.current.value = '';
                }
            };

            // reads the first file selected as a base64 encoded URL string
            fileReader.readAsDataURL(selectedFile);
        }
    };

    // creates a new object of type text in the portfolioContent array 
    // with a unique id of the timestamp it was added
    //documented
    const handleAddText = () => {
        setPortfolioContent([
            ...portfolioContent,
            {
                type: "text",
                content: '',
                id: Date.now(),
            }
        ]);
    }

    //documented
    const handleUpdatePortfolioContent = (id, content) => {
        // iterates through the portfoliionContent array objects 
        setPortfolioContent(portfolioContent.map(item => {
            // finds an object with an id matching the passed id
            if (item.id === id) {
                // returns the existing properties and their values of the object 
                // updates the value of the content property with content passed into the function 
                return {
                    ...item,
                    content
                };
            }
            // returns original object in the array that wasn't updated
            return item;
        }));
    }
   //documented 
    const handleRemovePortfolioContent = (id) => {
        // create a new array that contains objects where their id
        // doesn't match the id passed through the function
        setPortfolioContent(portfolioContent.filter(item => item.id !== id));
    }

    //documented
    const handlePortfolioCancel = () => {
        setPortfolioTitle("");
        setPortfolioDescription("");
        setPortfolioContent([]);
        setLoading(false);
        setError(null);
        if (onClose) {
            onClose();
        }
    }

    //documented
    const handlePortfolioUpload = async () => {

        setError(null);

        // check to see if the user has added a title, description, or content to the portfolio when trying to submit
        // if not stop the form submission and return an error message

        if (!portfolioTitle.trim()) {
            setError("Portfolio title is required");
            return;
        }
        if (!portfolioDescription.trim()) {
            setError("Portfolio description is required");
            return;
        }
        if (portfolioContent.length === 0) {
            setError("Portfolio content is required");
            return;
        }

        // disable submit and cancel buttons before server processing // disable submit and cancel buttons before server processing // disable submit and cancel buttons before server processing
        setLoading(true);

        try{
            //create a new a FormData object
            const formData = new FormData();

            // check if the session data required for the backend ends
            if (!session?.user?.id || !session?.user?.profileType) {
                throw new Error("Missing required user information");
            }

            // add session data and simple portfolio data to the form 
            formData.append("userId", session.user.id);
            formData.append("profileType", session.user.profileType);
            formData.append("title", portfolioTitle);
            formData.append("description", portfolioDescription);

            // create a counter for images within the array to track their order
            let imageCounter = 0;

            // create a new array of portfolio content suitable for storing
            const portfolioContentStoreStructure = portfolioContent.map((item, index) => {
                if (item.type === "image") {
                    //if the portfolio item is image based
                    // add the file uploaded by the user to the form
                    formData.append('images', item.file);
                    // return a new object with its type, position among images only, and array index
                    return {
                        type: item.type,
                        imageOrder: imageCounter++,
                        contentOrder: index // maintain item order within the array
                    };
                } else if (item.type === "text") {
                    // if porttfolio item is text based
                    // return a new object with its type, text input, and array index
                    return {
                        type: item.type,
                        content: item.content,
                        contentOrder: index // maintain item order within the array
                    };
                }
                return null;
            }).filter(Boolean); // remove empty property values from the array

            // add new structure array to form
            formData.append("portfolioContent", JSON.stringify(portfolioContentStoreStructure));

            const response = await fetch(`${getApiUrl()}/api/portfolios/create-portfolio`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.accessToken}` // include nextauth token
                },
                body: formData // send form data
            });

            if (response.ok){
                const data = await response.json();
                console.log("Portfolio uploaded successfully:", data);

                // loop through portfolioContent array
                portfolioContent.forEach((item, index) => {
                    // process only image objects with a valid portfolio id
                    if (item.type === 'image' && data.portfolioId){
                        // create a unique key using the portfolid Id and images array index
                        const key = `portfolioImage-${data.portfolioId}-${index}`
                        //store base64 encoded image in local storage using its key
                        localStorage.setItem(key, item.preview);
                        console.log("Stored image in localStorage:", key);
                    }
                });
                // display success message to the user
                setError("Portfolio uploaded successfully");

                // reset state variables and execute the onClose prop from parent component with a delay
                setTimeout(() => {
                    handlePortfolioCancel();
                }, 1000);
                // refresh page to show created portfolio
                window.location.reload();
            } else {
                const errorData = await response.json();
                console.error("Error response data:", errorData);
            }
        }catch(error){
            console.error("Error uploading portfolio:", error);
        }
    }

    //documented
    const previewPortfolioContent = (item, index) => {
        switch(item.type){
            case "image":
                return (
                    <div key={item.id} className="relative">
                        <img 
                        src={item.preview} 
                        alt={`Portfolio Image Content ${index + 1}`} 
                        className="w-full h-auto min-h-10" />
                        <button
                            type="button" 
                            onClick={() => handleRemovePortfolioContent(item.id)} 
                            className="absolute top-2 right-2 text-red-800 bg-white rounded-full cursor-pointer">
                            <XCircleIcon className="h-10 w-10" />
                        </button>
                    </div>
                );
            case "text":
                return (
                    <div key={item.id} className="relative">
                        <textarea 
                            value={item.content}
                            onChange={(e) => handleUpdatePortfolioContent(item.id, e.target.value)}
                            placeholder="Add your text here"
                            className="w-full p-3 min-h-[100px]"
                        />
                        <button
                            type="button" 
                            onClick={() => handleRemovePortfolioContent(item.id)} 
                            className="absolute -top-9 -right-9 text-red-800 rounded-full p-10 cursor-pointer">
                            <XCircleIcon className="h-10 w-10" />
                        </button>
                    </div>
                );
            default:
                return null;
        }
    }

    //documented
    return (        
        <div className="fixed inset-0 flex flex-col bg-gray-100 z-[10000] w-full h-full" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="flex flex-row justify-between p-3 items-center bg-white shadow-md">
                <div className="flex flex-col gap-2 w-1/2">
                    <input 
                        type="text"
                        value={portfolioTitle}
                        onChange={(e) => setPortfolioTitle(e.target.value)}
                        placeholder="Add Portfolio Title here"
                        className="border border-gray-300 rounded-md p-1 w-full"
                    />
                    <input 
                        type="text"
                        value={portfolioDescription}
                        onChange={(e) => setPortfolioDescription(e.target.value)}
                        placeholder="Add Portfolio description here"
                        className="border border-gray-300 text-sm rounded-md p-1 w-full"
                    />
                </div>
                <div className="flex flex-row space-x-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        onClick={(handlePortfolioUpload)} 
                        className="p-2 cursor-pointer rounded-xl w-32 bg-[rgb(217,217,217)] text-black font-semibold hover:bg-secondary hover:text-white transition-colors duration-200">
                        {loading ? "Saving..." : "Save"}
                    </button>
                    <button 
                        type="button" 
                        disabled={loading}
                        onClick={(handlePortfolioCancel)} 
                        className="p-2 cursor-pointer rounded-xl w-36 bg-[rgb(217,217,217)] text-black font-semibold hover:bg-secondary hover:text-white transition-colors duration-200">
                        Cancel
                    </button>
                </div>
            </div>
            {error && (
                <div className={`mx-4 mt-2 p-3 rounded-md ${error.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {error}
                </div>
            )}
            <div className="flex flex-row justify-evenly w-full mt-10 flex-grow">
                {/* left side panel to display portfolio components that were added */}
                <div className="bg-white shadow-lg flex flex-col text-center w-9/12 h-[660px] overflow-y-auto">
                    {portfolioContent.length === 0 ? (
                        // display message if no portfoio components have been added
                        <div className="text-center p-10">
                            <p className="text-gray-500">Add content from the right to start building and previewing your portfolio.</p>
                        </div>
                    ) : (
                        //maps through the portfolioContent array to transform each object into react components 
                        // that are then displayed in the order they were added
                        <div className="w-full">
                            {portfolioContent.map((item, index) => previewPortfolioContent(item, index))}
                        </div>
                    )}
                </div>
                {/* right side panel for individually adding portfolio components (text or image) */}
                <div className="w-72 bg-[rgb(217,217,217)] rounded-t-lg shadow-lg flex flex-col outline outline-2 outline-gray-400 h-fit">
                    <h3 className="p-3 font-semibold">Add Content</h3>
                    <div className="flex flex-row justify-evenly itens-center w-full bg-white">
                        <button onClick={handleAddImageClick} className=" hover:bg-gray-100 p-2 font-semibold w-full flex flex-col items-center">
                            <PhotoIcon className="h-10"/>
                            Image
                        </button>
                        <button onClick={handleAddText} className=" hover:bg-gray-100 p-2 font-semibold w-full flex flex-col items-center">
                            <PencilSquareIcon className="h-10"/>
                            Text
                        </button>
                    </div>
                    {/* hidden input field to open the systems file browser for image additions */}
                    <input
                        className="hidden"
                        ref={inputFileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleAddImage}
                    />
                </div>
            </div>
        </div>
    );
}
export default CreatePortfolio;