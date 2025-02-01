import Navbar from "@/components/navbar";
import Topbar from "@/components/topbar";
import ProfileCard from "@/components/profile-card";
import ContentDisplay from "@/components/display-content";

export default function Profile() {
    return (
      <div className="min-h-screen">
        <Topbar />
        <main className="">
          <Navbar />
          <div className="ml-[172px] mt-16">
            <ProfileCard />
            <ContentDisplay />
          </div>
        </main>
      </div>
    );
}
