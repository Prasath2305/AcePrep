"use client"
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { FileDown, Plus, Trash2, Sparkles, Link as LinkIcon } from 'lucide-react';
import { toast } from '../components/ui/sonner';

export const ResumePage = () => {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState({
    personal: { name: '', email: '', phone: '', linkedin: '', github: '' },
    summary: '',
    education: [{ college: '', degree: '', cgpa: '', year: '' }],
    skills: { technical: '', soft: '' },
    projects: [{ title: '', description: '', techStack: '', link: '' }],
    experience: [{ company: '', role: '', duration: '', description: '' }],
    certifications: [{ name: '', issuer: '', date: '', link: '' }],
    achievements: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    const { data } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setResumeData({
        personal: (data.personal_details as any) || resumeData.personal,
        summary: data.summary || '',
        education: (data.education as any) || resumeData.education,
        skills: (data.skills as any) || resumeData.skills,
        projects: (data.projects as any) || resumeData.projects,
        experience: (data.work_experience as any) || resumeData.experience,
        certifications: (data.certifications as any) || resumeData.certifications,
        achievements: (data.achievements as string) || ''
      });
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('resumes')
      .upsert({
        user_id: user?.id,
        personal_details: resumeData.personal,
        summary: resumeData.summary,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects,
        work_experience: resumeData.experience,
        certifications: resumeData.certifications,
        achievements: resumeData.achievements
      });

    if (error) {
      toast.error('Failed to save resume');
    } else {
      toast.success('Resume saved successfully!');
    }
  };

  const handleDownload = async () => {
    toast.info('PDF generation will be implemented via edge function');
  };

  const generateWithAI = async (type: 'summary' | 'skills' | 'project') => {
  if (!resumeData.personal.name) {
    toast.error('Please enter your name first');
    return;
  }

  setIsGenerating(true);
  
  try {
    console.log('🔵 Starting AI generation for:', type);
    
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Gemini API key not found. Please check your environment variables.');
    }

    const prompt = getAIPrompt(type, resumeData, resumeData.personal.name);
    console.log('📝 Prompt:', prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    console.log('🔵 Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error response:', errorText);
      
      let errorMessage = `Gemini API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use the text response
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('🟢 Gemini API full response:', JSON.stringify(data, null, 2));

    // Improved response validation
    if (!data) {
      throw new Error('Empty response from Gemini API');
    }

    // Check for API errors in response
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API returned an error');
    }

    // Check for prompt feedback (safety issues)
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Content blocked due to: ${data.promptFeedback.blockReason}`);
    }

    // Multiple ways to extract the generated text
    let generatedText = '';
    
    // Method 1: Standard candidate format
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content?.parts?.[0]?.text) {
        generatedText = candidate.content.parts[0].text.trim();
      }
    }
    
    // Method 2: Direct text in response (some API versions)
    if (!generatedText && data.text) {
      generatedText = data.text.trim();
    }
    
    // Method 3: Check for alternative response formats
    if (!generatedText && data.contents?.[0]?.parts?.[0]?.text) {
      generatedText = data.contents[0].parts[0].text.trim();
    }

    if (!generatedText) {
      console.warn('⚠️ No generated text found in response, trying to find any text...');
      
      // Last resort: try to find any text in the response
      const jsonString = JSON.stringify(data);
      const textMatch = jsonString.match(/"text"\s*:\s*"([^"]+)"/);
      if (textMatch) {
        generatedText = textMatch[1].trim();
      }
    }

    if (!generatedText) {
      throw new Error('No generated content found in API response. Response format: ' + JSON.stringify(data, null, 2));
    }

    console.log('✅ Generated text:', generatedText);
    
    // Update the resume data based on the type
    switch (type) {
      case 'summary':
        setResumeData(prev => ({ ...prev, summary: generatedText }));
        break;
      case 'skills':
        setResumeData(prev => ({
          ...prev,
          skills: { ...prev.skills, technical: generatedText }
        }));
        break;
      case 'project':
        const newProjects = [...resumeData.projects];
        if (newProjects.length === 0) {
          newProjects.push({ 
            title: 'AI Generated Project', 
            description: generatedText, 
            techStack: '', 
            link: '' 
          });
        } else {
          newProjects[0] = { 
            ...newProjects[0], 
            description: generatedText 
          };
        }
        setResumeData(prev => ({ ...prev, projects: newProjects }));
        break;
    }
    
    toast.success('Content generated successfully!');
    
  } catch (error) {
    console.error('❌ AI generation failed:', error);
    
    // More specific error messages
    let userMessage = 'Failed to generate content. ';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        userMessage += 'Please check your API key configuration.';
      } else if (error.message.includes('blocked')) {
        userMessage += 'The content was blocked for safety reasons.';
      } else if (error.message.includes('quota')) {
        userMessage += 'API quota exceeded. Please check your usage limits.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage += 'Network error. Please check your connection.';
      } else {
        userMessage += error.message;
      }
    } else {
      userMessage += 'Please check your API key and try again.';
    }
    
    toast.error(userMessage);
  } finally {
    setIsGenerating(false);
  }
};

// Add this helper function to your component
const getAIPrompt = (type: string, userData: any, userName: string): string => {
  const baseContext = `
Based on this resume information:
Name: ${userName}
Education: ${userData.education?.map((edu: any) => `${edu.degree} at ${edu.college}`).join(', ') || 'Not specified'}
Skills: ${userData.skills?.technical || 'Not specified'}
Projects: ${userData.projects?.map((proj: any) => proj.title).join(', ') || 'Not specified'}
Experience: ${userData.experience?.map((exp: any) => `${exp.role} at ${exp.company}`).join(', ') || 'Not specified'}
`;

  switch (type) {
    case 'summary':
      return `${baseContext}
Create a professional 2-3 sentence summary for ${userName} that:
- Highlights their key technical skills and experience
- Shows their career objectives and strengths  
- Sounds professional and compelling
- Is tailored for software development roles

Keep it concise and impactful:`;

    case 'skills':
      return `${baseContext}
Generate a comprehensive list of technical skills for ${userName}. 
Based on their background, suggest relevant skills in this format: comma-separated list.
Include programming languages, frameworks, tools, and technologies:`;

    case 'project':
      const currentProject = userData.projects?.[0];
      const projectContext = currentProject ? `
For this project:
Title: ${currentProject.title || 'Software Development Project'}
Tech Stack: ${currentProject.techStack || 'Not specified'}
` : 'For a software development project:';

      return `${baseContext}${projectContext}
Write a compelling project description (2-3 sentences) that:
- Describes the project's purpose and key features
- Highlights the technologies used
- Shows the impact or outcomes achieved
- Uses professional, achievement-oriented language:`;

    default:
      return `${baseContext}
Write professional resume content for ${userName} focusing on technical skills and experience.`;
  }
};

  // Education functions
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { college: '', degree: '', cgpa: '', year: '' }]
    });
  };

  const removeEducation = (index: number) => {
    if (resumeData.education.length > 1) {
      const newEducation = resumeData.education.filter((_, i) => i !== index);
      setResumeData({ ...resumeData, education: newEducation });
    }
  };

  // Project functions
  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, { title: '', description: '', techStack: '', link: '' }]
    });
  };

  const removeProject = (index: number) => {
    if (resumeData.projects.length > 1) {
      const newProjects = resumeData.projects.filter((_, i) => i !== index);
      setResumeData({ ...resumeData, projects: newProjects });
    }
  };

  // Certification functions
  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, { name: '', issuer: '', date: '', link: '' }]
    });
  };

  const removeCertification = (index: number) => {
    if (resumeData.certifications.length > 1) {
      const newCertifications = resumeData.certifications.filter((_, i) => i !== index);
      setResumeData({ ...resumeData, certifications: newCertifications });
    }
  };

  // Experience functions
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { company: '', role: '', duration: '', description: '' }]
    });
  };

  const removeExperience = (index: number) => {
    if (resumeData.experience.length > 1) {
      const newExperience = resumeData.experience.filter((_, i) => i !== index);
      setResumeData({ ...resumeData, experience: newExperience });
    }
  };

  const formatLink = (url: string) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Resume Builder
          </h1>
          <p className="text-muted-foreground mt-2">Create your professional resume</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save Resume</Button>
          <Button onClick={handleDownload} variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={resumeData.personal.name}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personal: { ...resumeData.personal, name: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={resumeData.personal.email}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personal: { ...resumeData.personal, email: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={resumeData.personal.phone}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personal: { ...resumeData.personal, phone: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>LinkedIn Username</Label>
                <Input
                  placeholder="username"
                  value={resumeData.personal.linkedin}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personal: { ...resumeData.personal, linkedin: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>GitHub Username</Label>
                <Input
                  placeholder="username"
                  value={resumeData.personal.github}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personal: { ...resumeData.personal, github: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Professional Summary</CardTitle>
              <Button 
                onClick={() => generateWithAI('summary')} 
                disabled={isGenerating}
                size="sm" 
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write a brief summary about your professional background and career objectives..."
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Education</CardTitle>
              <Button onClick={addEducation} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-1" />
                Add Education
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="border p-4 rounded-md space-y-3 bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      Education #{idx + 1}
                    </h4>
                    {resumeData.education.length > 1 && (
                      <Button
                        onClick={() => removeEducation(idx)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="College Name"
                    value={edu.college}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[idx].college = e.target.value;
                      setResumeData({ ...resumeData, education: newEdu });
                    }}
                  />
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[idx].degree = e.target.value;
                      setResumeData({ ...resumeData, education: newEdu });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="CGPA"
                      value={edu.cgpa}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[idx].cgpa = e.target.value;
                        setResumeData({ ...resumeData, education: newEdu });
                      }}
                    />
                    <Input
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => {
                        const newEdu = [...resumeData.education];
                        newEdu[idx].year = e.target.value;
                        setResumeData({ ...resumeData, education: newEdu });
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Skills</CardTitle>
              <Button 
                onClick={() => generateWithAI('skills')} 
                disabled={isGenerating}
                size="sm" 
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Technical Skills</Label>
                <Textarea
                  placeholder="Python, JavaScript, React, Node.js..."
                  value={resumeData.skills.technical}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    skills: { ...resumeData.skills, technical: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Soft Skills</Label>
                <Textarea
                  placeholder="Communication, Leadership, Problem Solving..."
                  value={resumeData.skills.soft}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    skills: { ...resumeData.skills, soft: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => generateWithAI('project')} 
                  disabled={isGenerating}
                  size="sm" 
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI Generate
                </Button>
                <Button onClick={addProject} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.projects.map((project, idx) => (
                <div key={idx} className="border p-4 rounded-md space-y-3 bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      Project #{idx + 1}
                    </h4>
                    {resumeData.projects.length > 1 && (
                      <Button
                        onClick={() => removeProject(idx)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Project Title"
                    value={project.title}
                    onChange={(e) => {
                      const newProjects = [...resumeData.projects];
                      newProjects[idx].title = e.target.value;
                      setResumeData({ ...resumeData, projects: newProjects });
                    }}
                  />
                  <Textarea
                    placeholder="Project Description"
                    value={project.description}
                    onChange={(e) => {
                      const newProjects = [...resumeData.projects];
                      newProjects[idx].description = e.target.value;
                      setResumeData({ ...resumeData, projects: newProjects });
                    }}
                    rows={3}
                  />
                  <Input
                    placeholder="Tech Stack"
                    value={project.techStack}
                    onChange={(e) => {
                      const newProjects = [...resumeData.projects];
                      newProjects[idx].techStack = e.target.value;
                      setResumeData({ ...resumeData, projects: newProjects });
                    }}
                  />
                  <Input
                    placeholder="Project Link (optional)"
                    value={project.link}
                    onChange={(e) => {
                      const newProjects = [...resumeData.projects];
                      newProjects[idx].link = e.target.value;
                      setResumeData({ ...resumeData, projects: newProjects });
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Certifications</CardTitle>
              <Button onClick={addCertification} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-1" />
                Add Certification
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.certifications.map((cert, idx) => (
                <div key={idx} className="border p-4 rounded-md space-y-3 bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      Certification #{idx + 1}
                    </h4>
                    {resumeData.certifications.length > 1 && (
                      <Button
                        onClick={() => removeCertification(idx)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Certification Name"
                    value={cert.name}
                    onChange={(e) => {
                      const newCerts = [...resumeData.certifications];
                      newCerts[idx].name = e.target.value;
                      setResumeData({ ...resumeData, certifications: newCerts });
                    }}
                  />
                  <Input
                    placeholder="Issuing Organization"
                    value={cert.issuer}
                    onChange={(e) => {
                      const newCerts = [...resumeData.certifications];
                      newCerts[idx].issuer = e.target.value;
                      setResumeData({ ...resumeData, certifications: newCerts });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Date"
                      value={cert.date}
                      onChange={(e) => {
                        const newCerts = [...resumeData.certifications];
                        newCerts[idx].date = e.target.value;
                        setResumeData({ ...resumeData, certifications: newCerts });
                      }}
                    />
                    <Input
                      placeholder="Certificate Link"
                      value={cert.link}
                      onChange={(e) => {
                        const newCerts = [...resumeData.certifications];
                        newCerts[idx].link = e.target.value;
                        setResumeData({ ...resumeData, certifications: newCerts });
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white text-black p-8 rounded-lg shadow-lg min-h-[800px]">
                {/* Header */}
                <div className="text-center mb-6 border-b pb-4">
                  <h2 className="text-3xl font-bold mb-2">{resumeData.personal.name || 'Your Name'}</h2>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
                    {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
                    {resumeData.personal.linkedin && (
                      <a 
                        href={formatLink(`https://linkedin.com/in/${resumeData.personal.linkedin}`)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        LinkedIn
                      </a>
                    )}
                    {resumeData.personal.github && (
                      <a 
                        href={formatLink(`https://github.com/${resumeData.personal.github}`)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:underline flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold border-b-2 border-black mb-2">Summary</h3>
                    <p className="text-sm">{resumeData.summary}</p>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.some(edu => edu.college) && (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold border-b-2 border-black mb-2">Education</h3>
                    {resumeData.education.map((edu, idx) => (
                      edu.college && (
                        <div key={idx} className="mb-3">
                          <p className="font-semibold">{edu.college}</p>
                          <p className="text-sm">{edu.degree} {edu.cgpa && `| CGPA: ${edu.cgpa}`} {edu.year && `| ${edu.year}`}</p>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Skills */}
                {(resumeData.skills.technical || resumeData.skills.soft) && (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold border-b-2 border-black mb-2">Skills</h3>
                    {resumeData.skills.technical && (
                      <p className="text-sm mb-1"><strong>Technical:</strong> {resumeData.skills.technical}</p>
                    )}
                    {resumeData.skills.soft && (
                      <p className="text-sm"><strong>Soft Skills:</strong> {resumeData.skills.soft}</p>
                    )}
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.some(proj => proj.title) && (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold border-b-2 border-black mb-2">Projects</h3>
                    {resumeData.projects.map((project, idx) => (
                      project.title && (
                        <div key={idx} className="mb-3">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold">{project.title}</p>
                            {project.link && (
                              <a 
                                href={formatLink(project.link)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <LinkIcon className="w-3 h-3" />
                                View Project
                              </a>
                            )}
                          </div>
                          {project.techStack && <p className="text-sm text-gray-600 mb-1">Tech: {project.techStack}</p>}
                          <p className="text-sm">{project.description}</p>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {resumeData.certifications.some(cert => cert.name) && (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold border-b-2 border-black mb-2">Certifications</h3>
                    {resumeData.certifications.map((cert, idx) => (
                      cert.name && (
                        <div key={idx} className="mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{cert.name}</p>
                              <p className="text-sm">{cert.issuer} {cert.date && `| ${cert.date}`}</p>
                            </div>
                            {cert.link && (
                              <a 
                                href={formatLink(cert.link)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <LinkIcon className="w-3 h-3" />
                                Verify
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};