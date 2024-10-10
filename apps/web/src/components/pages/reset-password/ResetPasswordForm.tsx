import React, { useState } from "react";
import { useRouter } from "next/router";
import TextLogo from "@/components/common/TextLogo";
import toast from "react-hot-toast";
import { resetPassword } from "@/utils/simpletuja/auth"; // Import the resetPassword function
import { AxiosError } from "axios";
import { LocalStorageKey } from "@/utils/const";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await resetPassword({ token, newPassword });
      toast.success("Password reset successful!");
      localStorage.setItem(LocalStorageKey.AccessToken, response.accessToken);
      router.push("/app");
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data as { message: string };
      toast.error(data.message);
    }
  };

  return (
    <div className="h-[520px]">
      <div>
        <div onClick={handleLogoClick} className="cursor-pointer select-none">
          <TextLogo fontSize="text-2xl" />
        </div>
        <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-100">
          Reset your password
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-10">
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium leading-6 text-gray-100"
            >
              New password
            </label>
            <div className="mt-2">
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium leading-6 text-gray-100"
            >
              Confirm password
            </label>
            <div className="mt-2">
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="mt-8 flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
