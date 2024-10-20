import React, { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { sendResetPasswordEmail } from "@/utils/simpletuja/auth";
import Logo from "@/components/common/Logo";

const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    await sendResetPasswordEmail({ email });
    toast.success("An email with reset link has been sent.");
    setIsEmailSent(true);
  };

  return (
    <div className="h-[520px]">
      <div>
        <div onClick={handleLogoClick} className="cursor-pointer select-none">
          <Logo />
        </div>
        <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-100">
          {isEmailSent ? "Reset email sent!" : "Forgot password"}
        </h2>
        {isEmailSent ? (
          <p className="mt-2 text-sm leading-6 text-gray-400">
            An email with the reset link has been sent. Please check your inbox.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Enter your email to receive a password reset link.
          </p>
        )}
      </div>

      {!isEmailSent && (
        <div className="mt-10">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-100"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="mt-8 flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
