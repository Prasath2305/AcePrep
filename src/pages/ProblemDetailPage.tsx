"use client"
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Play, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '../components/ui/sonner';

export const ProblemDetailPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchProblem();
  }, [id]);

  useEffect(() => {
    if (problem) {
      const starterCode = {
        python: problem.starter_code_python,
        javascript: problem.starter_code_javascript,
        java: problem.starter_code_java,
        cpp: problem.starter_code_cpp
      }[language] || '';
      setCode(starterCode);
    }
  }, [language, problem]);

  const fetchProblem = async () => {
    const { data, error } = await supabase
      .from('problems')
      .select('*, test_cases(*)')
      .eq('id', id)
      .single();

    if (data) setProblem(data);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    
    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code, language, problemId: id, isSubmit: false }
      });

      if (error) throw error;
      setOutput(data.output || JSON.stringify(data, null, 2));
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
      toast.error('Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code, language, problemId: id, isSubmit: true }
      });

      if (error) throw error;
      
      if (data.status === 'Accepted') {
        toast.success('All test cases passed! 🎉');
      } else {
        toast.error(`${data.status}: Some test cases failed`);
      }
      
      setOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      toast.error('Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-2xl">{problem.title}</CardTitle>
              <Badge variant="outline">{problem.difficulty}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {problem.companies?.map((company: string) => (
                <Badge key={company} variant="secondary">{company}</Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{problem.description}</div>
            </div>
            
            {problem.test_cases?.some((tc: any) => !tc.is_hidden) && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Example Test Cases:</h3>
                {problem.test_cases
                  .filter((tc: any) => !tc.is_hidden)
                  .map((tc: any, idx: number) => (
                    <div key={tc.id} className="bg-muted p-3 rounded-md mb-2">
                      <p className="font-mono text-sm">
                        <span className="text-muted-foreground">Input:</span> {tc.input}
                      </p>
                      <p className="font-mono text-sm">
                        <span className="text-muted-foreground">Output:</span> {tc.expected_output}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Code Editor</CardTitle>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono min-h-[300px] bg-code-bg text-code-foreground"
                placeholder="Write your code here..."
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleRun} disabled={running || submitting}>
                  {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Run
                </Button>
                <Button onClick={handleSubmit} disabled={running || submitting} variant="default">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>

          {output && (
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="font-mono text-sm bg-muted p-4 rounded-md overflow-auto max-h-[200px]">
                  {output}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
