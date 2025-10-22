"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  companies: string[];
}

export const ProblemsPage = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [allCompanies, setAllCompanies] = useState<string[]>([]);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, searchTerm, difficultyFilter, companyFilter]);

  const fetchProblems = async () => {
    const { data, error } = await supabase
      .from('problems')
      .select('id, title, difficulty, companies')
      .order('created_at', { ascending: false });

    if (data) {
      setProblems(data);
      const companies = new Set<string>();
      data.forEach(p => p.companies?.forEach(c => companies.add(c)));
      setAllCompanies(Array.from(companies).sort());
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(p => p.difficulty === difficultyFilter);
    }

    if (companyFilter !== 'all') {
      filtered = filtered.filter(p => p.companies?.includes(companyFilter));
    }

    setFilteredProblems(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-accent/10 text-accent border-accent/20';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'Hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#2960ea] via-[#7b3ced] to-[#2960ea] bg-clip-text text-transparent">
          Practice Problems
        </h1>
        <p className="text-muted-foreground">
          Solve {filteredProblems.length} coding challenges from top companies
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="all" className="hover:bg-green-600 hover:text-white">All Difficulties</SelectItem>
            <SelectItem value="Easy" className="hover:bg-green-600 hover:text-white">Easy</SelectItem>
            <SelectItem value="Medium" className="hover:bg-green-600 hover:text-white">Medium</SelectItem>
            <SelectItem value="Hard" className="hover:bg-green-600 hover:text-white">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="all" className="hover:bg-green-600 hover:text-white">All Companies</SelectItem>
            {allCompanies.map(company => (
              <SelectItem key={company} value={company} className="hover:bg-green-600 hover:text-white">
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredProblems.map((problem) => (
          <Link key={problem.id} to={`/problem/${problem.id}`}>
            <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{problem.title}</CardTitle>
                  <Badge className={getDifficultyColor(problem.difficulty)} variant="outline">
                    {problem.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {problem.companies?.map((company) => (
                    <Badge key={company} variant="secondary">
                      {company}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No problems found matching your filters.</p>
        </div>
      )}
    </div>
  );
};