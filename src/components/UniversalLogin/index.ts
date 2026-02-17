// CloneX Universal Login - Portable Component Package
// Version: 1.0.0
//
// This package provides a fully self-contained authentication UI
// that can be deployed across the CloneX ecosystem:
// - Web applications (React)
// - iOS applications (WebView)
// - UE5 Phoenix Frontend (embedded browser)
//
// Usage:
// ```tsx
// import { UniversalLoginButton } from './components/UniversalLogin';
//
// function App() {
//   return (
//     <UniversalLoginButton
//       routes={{
//         profile: '/profile',
//         collections: '/collections'
//       }}
//       onNavigate={(route) => router.push(route)}
//     />
//   );
// }
// ```

export { UniversalLoginButton } from './UniversalLoginButton';
export { UniversalLoginModal } from './UniversalLoginModal';

export type { UniversalLoginButtonProps, UniversalLoginRoutes } from './UniversalLoginButton';
