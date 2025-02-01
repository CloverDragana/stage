import FormRow from "./login-form-row";

function LoginForm(){

    const handleFormSubmission = (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');
        console.log({username, password});
    }

    return(
        <form onSubmit={handleFormSubmission} className="w-full">
            <FormRow label="Username" id="username" />
            <FormRow label="Password" id="password" type="password" />
            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-white text-slate-800 px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">Start Your Adventure</button>
            </div>
        </form>
    );
};

export default LoginForm;