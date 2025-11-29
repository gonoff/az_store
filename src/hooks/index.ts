/**
 * Hooks Barrel Exports
 * Re-exports all custom hooks from a single entry point
 */

// Product hooks
export {
  useProducts,
  useProduct,
  useMethods,
  useFilters,
  useDesignSizes,
  useCalculatePrice,
  useValidateConfiguration,
} from './use-products';

// Order hooks
export { useOrders, useOrder, useTrackOrder, useCreateOrder, useRequestChange } from './use-orders';

// Auth hooks
export {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
  useResetPassword,
  useResendVerification,
  useRefreshToken,
} from './use-auth';

// Customer hooks
export {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useConsent,
  useUpdateConsent,
  useDeleteAccount,
} from './use-customer';
