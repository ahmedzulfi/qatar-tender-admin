import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <>
      <div className="div">
        <Link href={"/admin"}>GO To Admin</Link>
      </div>
    </>
  );
}
