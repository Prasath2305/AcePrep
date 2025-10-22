import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, problemId, isSubmit } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: testCases } = await supabase
      .from('test_cases')
      .select('*')
      .eq('problem_id', problemId);

    if (!testCases || testCases.length === 0) {
      throw new Error('No test cases found');
    }

    const casesToRun = isSubmit ? testCases : testCases.filter(tc => !tc.is_hidden).slice(0, 1);
    const results = [];

    for (const tc of casesToRun) {
      const pistonResp = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language,
          version: '*',
          files: [{ content: code }],
          stdin: tc.input
        })
      });

      const result = await pistonResp.json();
      const output = result.run?.stdout?.trim() || '';
      const passed = output === tc.expected_output.trim();

      results.push({ passed, output, expected: tc.expected_output });
    }

    const allPassed = results.every(r => r.passed);

    return new Response(
      JSON.stringify({
        status: allPassed ? 'Accepted' : 'Wrong Answer',
        results,
        output: results[0]?.output
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
