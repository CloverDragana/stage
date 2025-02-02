import FormRow from "./login-form-row";

function LoginForm(){

    const handleFormSubmission = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);

        const loginDetails = {
            username : formData.get('username'),
            password : formData.get('password')
        };
    

        console.log("Sending" , {username, password});

        try {
            const response = await fetch('/api/user-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(loginDetails),
            });

            const data = await response.json();
            console.log("Server Response: ", data);

            if (!response.ok){
                alert(`Login failed: ${data.error}`);
                return;
            }

            alert("Login successful;")
        } catch{
            console.log("Login error :", error);
            alert("Login didn't work, please try again");
        }
    };

    return(
        <form onSubmit={handleFormSubmission} className="w-full">
            <FormRow label="Username" id="username" name="username" />
            <FormRow label="Password" id="password" name="password" type="password" />
            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-white text-slate-800 px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">Start Your Adventure</button>
            </div>
        </form>
    );
};

export default LoginForm;