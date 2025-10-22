import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../auth/AuthContext';
import { Code2, LogOut, User, FileText, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  // Helper function to determine button styles
  const getButtonStyles = (path: string) => {
    const isCurrentPage = location.pathname === path;
    if (isCurrentPage) {
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
    return 'text-black hover:bg-green-600 hover:text-white';
  };

  return (
    <nav className="border-b bg-white text-black">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#2960ea] via-[#7b3ced] to-[#2960ea] bg-clip-text text-transparent">
              AcePrep
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/problems">
                  <Button 
                    variant="ghost" 
                    className={getButtonStyles('/problems')}
                  >
                    Problems
                  </Button>
                </Link>
                
                {isAdmin && (
                  <Link to="/admin">
                    <Button 
                      variant="ghost" 
                      className={getButtonStyles('/admin')}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                {!isAdmin && (
                  <Link to="/resume">
                    <Button 
                      variant="ghost" 
                      className={getButtonStyles('/resume')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  </Link>
                )}

                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={getButtonStyles('/profile')}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </Link>

                <Button 
                  variant="ghost" 
                  onClick={signOut}
                  className="text-black hover:bg-green-600 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};