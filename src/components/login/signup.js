import LoginForm from "@/components/login/login"

function SignUpForm(){

    return(
        <div>
            <label htmlFor="fname">First Name:</label>
            <input type="text" id="fname" name="fname"></input>
            <label htmlFor="lname">Last Name:</label>
            <input type="text" id="lname" name="lname"></input>
            <label htmlFor="email">Email Address:</label>
            <input type="text" id="email" name="email"></input>
            <LoginForm />
        </div>
    );
}

export default SignUpForm;