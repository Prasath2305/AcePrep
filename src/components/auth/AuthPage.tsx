// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Input } from '../ui/input';
// import { Button } from '../ui/button';
// import { Label } from '../ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import { useAuth } from './AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { Code2, Lock, Mail, User, Shield } from 'lucide-react';

// export const AuthPage = () => {
//   const { signIn, signUp } = useAuth();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const [loginData, setLoginData] = useState({ email: '', password: '' });
//   const [studentSignupData, setStudentSignupData] = useState({ name: '', email: '', password: '' });
//   const [adminSignupData, setAdminSignupData] = useState({ name: '', email: '', password: '', adminKey: '' });

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const { error } = await signIn(loginData.email, loginData.password);
//     setLoading(false);
    
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success('Logged in successfully!');
//       navigate('/');
//     }
//   };

//   const handleStudentSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const { error } = await signUp(studentSignupData.email, studentSignupData.password, studentSignupData.name);
//     setLoading(false);
    
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success('Account created! Please log in.');
//     }
//   };

//   const handleAdminSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const { error } = await signUp(
//       adminSignupData.email,
//       adminSignupData.password,
//       adminSignupData.name,
//       true,
//       adminSignupData.adminKey
//     );
//     setLoading(false);
    
//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success('Admin account created! Please log in.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
//       <div className="w-full max-w-4xl">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-2 mb-4">
//             <Code2 className="w-10 h-10 text-primary" />
//             <h1 className="text-6xl font-bold bg-gradient-to-r from-[#2960ea] via-[#7b3ced] to-[#2960ea] bg-clip-text text-transparent">
//               AcePrep
//             </h1>
//           </div>
//           <p className="text-muted-foreground">Master coding interviews, land your dream job</p>
//         </div>

//         <Tabs defaultValue="login" className="w-full">
//           <TabsList className="grid w-full grid-cols-3 bg-gray-200">
//             <TabsTrigger value="login">Login</TabsTrigger>
//             <TabsTrigger value="student">Student Signup</TabsTrigger>
//             <TabsTrigger value="admin">Admin Signup</TabsTrigger>
//           </TabsList>

//           <TabsContent value="login">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Welcome Back</CardTitle>
//                 <CardDescription>Log in to continue your coding journey</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleLogin} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="login-email">Email</Label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="login-email"
//                         type="email"
//                         placeholder="you@example.com"
//                         className="pl-9"
//                         value={loginData.email}
//                         onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="login-password">Password</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="login-password"
//                         type="password"
//                         placeholder="••••••••"
//                         className="pl-9"
//                         value={loginData.password}
//                         onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
//                     {loading ? 'Logging in...' : 'Log In'}
//                   </Button>
//                 </form>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="student">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Create Student Account</CardTitle>
//                 <CardDescription>Start practicing for your placement interviews</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleStudentSignup} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="student-name">Full Name</Label>
//                     <div className="relative">
//                       <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="student-name"
//                         placeholder="John Doe"
//                         className="pl-9"
//                         value={studentSignupData.name}
//                         onChange={(e) => setStudentSignupData({ ...studentSignupData, name: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="student-email">Email</Label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="student-email"
//                         type="email"
//                         placeholder="you@example.com"
//                         className="pl-9"
//                         value={studentSignupData.email}
//                         onChange={(e) => setStudentSignupData({ ...studentSignupData, email: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="student-password">Password</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="student-password"
//                         type="password"
//                         placeholder="••••••••"
//                         className="pl-9"
//                         value={studentSignupData.password}
//                         onChange={(e) => setStudentSignupData({ ...studentSignupData, password: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
//                     {loading ? 'Creating Account...' : 'Create Account'}
//                   </Button>
//                 </form>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="admin">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Create Admin Account</CardTitle>
//                 <CardDescription>Manage questions and review submissions</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleAdminSignup} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="admin-name">Full Name</Label>
//                     <div className="relative">
//                       <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="admin-name"
//                         placeholder="Jane Admin"
//                         className="pl-9"
//                         value={adminSignupData.name}
//                         onChange={(e) => setAdminSignupData({ ...adminSignupData, name: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="admin-email">Email</Label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="admin-email"
//                         type="email"
//                         placeholder="admin@example.com"
//                         className="pl-9"
//                         value={adminSignupData.email}
//                         onChange={(e) => setAdminSignupData({ ...adminSignupData, email: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="admin-password">Password</Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="admin-password"
//                         type="password"
//                         placeholder="••••••••"
//                         className="pl-9"
//                         value={adminSignupData.password}
//                         onChange={(e) => setAdminSignupData({ ...adminSignupData, password: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="admin-key">Admin Key</Label>
//                     <div className="relative">
//                       <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         id="admin-key"
//                         type="password"
//                         placeholder="Enter admin key"
//                         className="pl-9"
//                         value={adminSignupData.adminKey}
//                         onChange={(e) => setAdminSignupData({ ...adminSignupData, adminKey: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
//                     {loading ? 'Creating Account...' : 'Create Admin Account'}
//                   </Button>
//                 </form>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };








import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Code2, Lock, Mail, User } from 'lucide-react';

export const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [studentSignupData, setStudentSignupData] = useState({ name: '', email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      navigate('/');
    }
  };

  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(studentSignupData.email, studentSignupData.password, studentSignupData.name);
    setLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Please log in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="w-10 h-10 text-primary" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-[#2960ea] via-[#7b3ced] to-[#2960ea] bg-clip-text text-transparent">
              AcePrep
            </h1>
          </div>
          <p className="text-muted-foreground">Master coding interviews, land your dream job</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-200">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="student">Student Signup</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Log in to continue your coding journey</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Create Student Account</CardTitle>
                <CardDescription>Start practicing for your placement interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="student-name"
                        placeholder="John Doe"
                        className="pl-9"
                        value={studentSignupData.name}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9"
                        value={studentSignupData.email}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="student-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={studentSignupData.password}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 text-white" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};