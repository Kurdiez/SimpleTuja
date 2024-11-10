import Button from "@/components/common/Button";
import Logo from "@/components/common/Logo";
import { AppRoute } from "@/utils/app-route";
import { resetPassword } from "@/utils/simpletuja/auth"; // Import the resetPassword function
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useGlobalStates } from "../app/global-states.context";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { setSignedIn } = useGlobalStates();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const authResponse = await resetPassword({ token, newPassword });
      setSignedIn(authResponse);
      toast.success("Password reset successful!");
      router.push(AppRoute.CryptoLending);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data as { message: string };
      toast.error(data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[520px]">
      <div>
        <div onClick={handleLogoClick} className="cursor-pointer select-none">
          <Logo />
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
            <Button type="submit" className="w-full mt-8" loading={isLoading}>
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
