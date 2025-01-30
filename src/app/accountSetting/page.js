import Navbar from "@/components/navbar";
import Topbar from "@/components/topbar";
import ProfilePicture from "@/components/profile/profile-picture";

export default function AccountSetting() {
    return (
      <div className="min-h-screen">
        <Topbar />
        <main className="">
            <Navbar />
            <div className="ml-[172px] mt-16 p-6">
                <div className="rounded-3xl bg-secondary p-2">
                    <h2 className="font-bold text-4xl p-2 ">Profile Information</h2>
                    <form>
                        <div className="flex flex-row items-center gap-8">
                            <ProfilePicture />
                            <label htmlFor="fname">First Name:</label>
                            <input type="text" id="fname" name="fname"></input>
                            <label htmlFor="lname">Last Name:</label>
                            <input type="text" id="lname" name="lname"></input>
                        </div>
                    </form>
                </div>
            </div>
        </main>
      </div>
    );
}