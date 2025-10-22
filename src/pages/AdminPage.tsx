"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from '../components/ui/sonner';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const [problems, setProblems] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companies: '',
    difficulty: 'Easy',
    starter_code_python: '',
    starter_code_javascript: '',
    starter_code_java: '',
    starter_code_cpp: ''
  });
  const [testCases, setTestCases] = useState<Array<{ input: string; expected_output: string; is_hidden: boolean }>>([
    { input: '', expected_output: '', is_hidden: false }
  ]);

  useEffect(() => {
    if (isAdmin) fetchProblems();
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchProblems = async () => {
    const { data } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProblems(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const problemData = {
      ...formData,
      companies: formData.companies.split(',').map(c => c.trim()),
      created_by: user!.id
    };

    try {
      let problemId = editing;

      if (editing) {
        await supabase
          .from('problems')
          .update(problemData)
          .eq('id', editing);
      } else {
        const { data } = await supabase
          .from('problems')
          .insert(problemData)
          .select()
          .single();
        problemId = data?.id;
      }

      if (problemId) {
        await supabase
          .from('test_cases')
          .delete()
          .eq('problem_id', problemId);

        await supabase
          .from('test_cases')
          .insert(testCases.map(tc => ({ ...tc, problem_id: problemId })));
      }

      toast.success(editing ? 'Problem updated!' : 'Problem created!');
      resetForm();
      fetchProblems();
    } catch (err) {
      toast.error('Failed to save problem');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this problem?')) {
      await supabase.from('problems').delete().eq('id', id);
      toast.success('Problem deleted');
      fetchProblems();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      companies: '',
      difficulty: 'Easy',
      starter_code_python: '',
      starter_code_javascript: '',
      starter_code_java: '',
      starter_code_cpp: ''
    });
    setTestCases([{ input: '', expected_output: '', is_hidden: false }]);
    setEditing(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Admin Dashboard
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Problem' : 'Create New Problem'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Companies (comma-separated)</Label>
                <Input
                  value={formData.companies}
                  onChange={(e) => setFormData({ ...formData, companies: e.target.value })}
                  placeholder="Google, Amazon, Microsoft"
                />
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Python Starter Code</Label>
                <Textarea
                  value={formData.starter_code_python}
                  onChange={(e) => setFormData({ ...formData, starter_code_python: e.target.value })}
                  className="font-mono"
                  rows={3}
                />
              </div>

              <div>
                <Label>Test Cases</Label>
                {testCases.map((tc, idx) => (
                  <div key={idx} className="border p-4 rounded-md mb-2 space-y-2">
                    <Input
                      placeholder="Input (JSON format)"
                      value={tc.input}
                      onChange={(e) => {
                        const newTCs = [...testCases];
                        newTCs[idx].input = e.target.value;
                        setTestCases(newTCs);
                      }}
                    />
                    <Input
                      placeholder="Expected Output"
                      value={tc.expected_output}
                      onChange={(e) => {
                        const newTCs = [...testCases];
                        newTCs[idx].expected_output = e.target.value;
                        setTestCases(newTCs);
                      }}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tc.is_hidden}
                        onChange={(e) => {
                          const newTCs = [...testCases];
                          newTCs[idx].is_hidden = e.target.checked;
                          setTestCases(newTCs);
                        }}
                      />
                      Hidden Test Case
                    </label>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTestCases([...testCases, { input: '', expected_output: '', is_hidden: false }])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test Case
                </Button>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editing ? 'Update' : 'Create'} Problem</Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Existing Problems</h2>
          {problems.map((problem) => (
            <Card key={problem.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{problem.title}</h3>
                    <Badge variant="outline" className="mt-2">{problem.difficulty}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => {
                      setFormData({
                        title: problem.title,
                        description: problem.description,
                        companies: problem.companies?.join(', ') || '',
                        difficulty: problem.difficulty,
                        starter_code_python: problem.starter_code_python || '',
                        starter_code_javascript: problem.starter_code_javascript || '',
                        starter_code_java: problem.starter_code_java || '',
                        starter_code_cpp: problem.starter_code_cpp || ''
                      });
                      setEditing(problem.id);
                    }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(problem.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
