"use client"
import { useAuth } from '../components/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code2, Zap, Award, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/problems'} replace />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Code2 className="w-16 h-16" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-[#2960ea] via-[#7b3ced] to-[#2960ea] bg-clip-text text-transparent">
              AcePrep
            </h1>
          </div>
          
          <p className="text-2xl text-muted-foreground mb-8">
            Master coding interviews. Practice company-specific problems. Land your dream job.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 bg-blue-600 text-white">
                Get Started Free
              </Button>
            </Link>
            <Link to="/problems">
              <Button size="lg" variant="outline" className="text-lg px-8 hover:bg-green-600 hover:text-white">
                Explore Problems
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Practice Problems</h3>
              <p className="text-muted-foreground">
                Solve company-specific coding challenges with real-time code execution
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
              <p className="text-muted-foreground">
                Run and test your code against multiple test cases instantly
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Resume Builder</h3>
              <p className="text-muted-foreground">
                Create professional resumes with our built-in resume builder
              </p>
            </div>
          </div>

          <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Why PrepPortal?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide a comprehensive platform tailored for placement preparation. 
              Filter problems by companies, track your progress, and build your resume all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
