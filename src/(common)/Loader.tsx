
import Image from "next/image"; 
import siteLogo from "@/images/danta-suraksha-logo.png";

export default function Loader() {
    return (
        <>
        <div className="custom-loader">
            <div className="ripple-loader">
                <span className="ring ring1"></span>
                <span className="ring ring2"></span>
                <span className="ring ring3"></span>
                <div className="logo-wrapper">
                    <Image src={siteLogo.src} alt="Logo" width={200} height={200} />
                </div>
            </div>
        </div>
        </>
    );
}
