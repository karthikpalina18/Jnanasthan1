// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { Brain, Target, TrendingUp, AlertCircle, CheckCircle, XCircle, Activity, Database, Cpu, BarChart3, Zap, Award, Eye, Upload, FileText, Globe, RefreshCw, Download, Settings } from 'lucide-react';
// import * as tf from '@tensorflow/tfjs';

// const AtsScore = () => {
//   const [resume, setResume] = useState('');
//   const [jobDescription, setJobDescription] = useState('');
//   const [analysis, setAnalysis] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [model, setModel] = useState(null);
//   const [modelAccuracy, setModelAccuracy] = useState(null);
//   const [trainingProgress, setTrainingProgress] = useState(0);
//   const [selectedIndustry, setSelectedIndustry] = useState('Technology');
//   const [realTimeScore, setRealTimeScore] = useState(0);
//   const [isTraining, setIsTraining] = useState(false);
//   const [datasetSize, setDatasetSize] = useState(0);
//   const [liveDataFeed, setLiveDataFeed] = useState([]);
//   const [modelMetrics, setModelMetrics] = useState(null);
//   const [isCollectingData, setIsCollectingData] = useState(false);
//   const intervalRef = useRef(null);

//   // Real-time data sources simulation (in production, these would be actual APIs)
//   const realTimeDataSources = {
//     jobBoards: [
//       'https://api.indeed.com/v2/search',
//       'https://api.glassdoor.com/api/api.htm',
//       'https://api.linkedin.com/v2/jobSearch',
//       'https://remoteok.io/api',
//       'https://api.stackoverflow.com/jobs'
//     ],
//     resumeDatabases: [
//       'https://api.monster.com/v1/job-search',
//       'https://api.careerbuilder.com/v1/jobsearch',
//       'https://api.ziprecruiter.com/jobs/v1/search'
//     ]
//   };

//   // Large-scale training dataset structure
//   const [realTimeDataset, setRealTimeDataset] = useState({
//     technology: { samples: [], labels: [], lastUpdated: null },
//     healthcare: { samples: [], labels: [], lastUpdated: null },
//     finance: { samples: [], labels: [], lastUpdated: null },
//     marketing: { samples: [], labels: [], lastUpdated: null },
//     education: { samples: [], labels: [], lastUpdated: null },
//     engineering: { samples: [], labels: [], lastUpdated: null }
//   });

//   // Simulate real-time data collection from multiple sources
//   const collectRealTimeData = useCallback(async () => {
//     setIsCollectingData(true);
//     console.log('🔄 Starting real-time data collection...');

//     try {
//       // Simulate API calls to job boards and resume databases
//       for (let i = 0; i < 50; i++) {
//         const industryKeys = Object.keys(realTimeDataset);
//         const randomIndustry = industryKeys[Math.floor(Math.random() * industryKeys.length)];
        
//         // Simulate fetching job posting and resume pair
//         const jobData = await simulateJobBoardAPI(randomIndustry);
//         const resumeData = await simulateResumeAPI(randomIndustry);
//         const atsScore = await simulateATSScoring(resumeData.content, jobData.content);

//         // Add to dataset
//         setRealTimeDataset(prev => ({
//           ...prev,
//           [randomIndustry]: {
//             samples: [...prev[randomIndustry].samples.slice(-999), { // Keep last 1000 samples
//               resume: resumeData.content,
//               jobDescription: jobData.content,
//               features: extractAdvancedFeatures(resumeData.content, jobData.content),
//               timestamp: new Date().toISOString(),
//               source: jobData.source
//             }],
//             labels: [...prev[randomIndustry].labels.slice(-999), atsScore / 100],
//             lastUpdated: new Date().toISOString()
//           }
//         }));

//         setDatasetSize(prev => prev + 1);
        
//         // Update live feed
//         setLiveDataFeed(prev => [...prev.slice(-19), {
//           id: Date.now() + i,
//           industry: randomIndustry,
//           score: atsScore,
//           timestamp: new Date().toISOString(),
//           source: jobData.source
//         }]);

//         // Add small delay to simulate real API calls
//         await new Promise(resolve => setTimeout(resolve, 100));
//       }

//       console.log('✅ Real-time data collection completed');
//     } catch (error) {
//       console.error('❌ Error collecting real-time data:', error);
//     }

//     setIsCollectingData(false);
//   }, [realTimeDataset]);

//   // Simulate job board API responses
//   const simulateJobBoardAPI = async (industry) => {
//     const jobTemplates = {
//       technology: [
//         "Senior Software Engineer role requiring 5+ years experience in React, Node.js, Python, AWS, Docker, Kubernetes. Must have experience with microservices architecture, CI/CD pipelines, and agile methodologies. Competitive salary $120K-160K.",
//         "Full Stack Developer position for fintech startup. Need expertise in JavaScript, TypeScript, React, Express.js, MongoDB, Redis. Experience with payment systems, security protocols, and scalable architecture required.",
//         "DevOps Engineer wanted for cloud migration project. Skills required: AWS/Azure, Terraform, Jenkins, Kubernetes, Docker, monitoring tools. 7+ years experience managing large-scale infrastructure.",
//         "Data Scientist role focusing on machine learning and AI. PhD preferred. Need expertise in Python, TensorFlow, PyTorch, SQL, big data tools. Experience with NLP, computer vision, and statistical modeling.",
//         "Mobile App Developer for iOS/Android. Swift, Kotlin, React Native experience required. Need knowledge of app store optimization, performance tuning, and cross-platform development."
//       ],
//       healthcare: [
//         "Registered Nurse position in ICU. BSN required, 3+ years critical care experience. Must be ACLS certified, familiar with Epic EMR, and have strong patient assessment skills.",
//         "Healthcare Data Analyst role. Need experience with healthcare databases, HIPAA compliance, SQL, statistical analysis, and healthcare quality metrics. Master's degree preferred.",
//         "Medical Device Sales Representative. Biology/Engineering background preferred. Need knowledge of surgical procedures, hospital systems, and regulatory requirements. Travel required.",
//         "Clinical Research Coordinator position. Need experience with clinical trials, GCP guidelines, regulatory submissions, and patient recruitment. Life sciences degree required.",
//         "Healthcare Administrator for 200-bed hospital. MBA preferred. Need experience with budget management, staff coordination, quality improvement, and healthcare regulations."
//       ],
//       finance: [
//         "Investment Banking Analyst at top-tier firm. Need strong financial modeling skills, Excel expertise, and ability to work long hours. MBA or CFA preferred.",
//         "Risk Management Specialist for regional bank. FRM certification required. Need experience with credit risk, market risk, stress testing, and regulatory compliance.",
//         "Financial Planner for wealth management firm. CFP certification required. Need client relationship skills, investment knowledge, and sales ability.",
//         "Quantitative Analyst for hedge fund. PhD in Math/Physics/Engineering required. Need expertise in statistical modeling, derivatives pricing, and algorithmic trading.",
//         "Corporate Finance Manager for Fortune 500 company. CPA preferred. Need M&A experience, financial planning, budgeting, and ERP systems knowledge."
//       ]
//     };

//     const templates = jobTemplates[industry] || jobTemplates.technology;
//     const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
//     return {
//       content: randomTemplate,
//       source: 'JobBoardAPI',
//       postedDate: new Date().toISOString(),
//       industry: industry,
//       location: ['New York', 'San Francisco', 'Boston', 'Austin', 'Seattle'][Math.floor(Math.random() * 5)]
//     };
//   };

//   // Simulate resume database API responses
//   const simulateResumeAPI = async (industry) => {
//     const resumeTemplates = {
//       technology: [
//         "Experienced Software Engineer with 6+ years developing scalable web applications using React, Node.js, Python, and AWS. Led development of microservices architecture serving 500K+ users. Implemented CI/CD pipelines reducing deployment time by 70%. Strong background in agile methodologies and team leadership.",
//         "Full Stack Developer with expertise in JavaScript, TypeScript, React, Express.js, MongoDB. Built 20+ web applications for various clients. Experience with payment integration, API development, and database optimization. Familiar with cloud platforms and DevOps practices.",
//         "Senior DevOps Engineer with 8+ years experience managing cloud infrastructure on AWS and Azure. Expert in Kubernetes, Docker, Terraform, Jenkins. Automated deployment processes for applications handling millions of requests. Strong background in monitoring and security.",
//         "Data Scientist with PhD in Computer Science and 5+ years industry experience. Expert in machine learning, deep learning, Python, TensorFlow, PyTorch. Published 15+ research papers. Built predictive models achieving 95%+ accuracy. Experience with big data and cloud computing.",
//         "Mobile App Developer with 4+ years experience in iOS and Android development. Published 10+ apps with 1M+ downloads. Expert in Swift, Kotlin, React Native. Strong UI/UX skills and performance optimization experience."
//       ],
//       healthcare: [
//         "Registered Nurse with 7+ years ICU experience. BSN degree, ACLS certified. Expert in patient assessment, medication administration, and Epic EMR. Reduced patient readmission rates by 20% through improved care coordination.",
//         "Healthcare Data Analyst with 5+ years experience analyzing clinical data. Expert in SQL, Python, statistical analysis. Implemented quality improvement initiatives saving $2M annually. Strong knowledge of healthcare regulations and HIPAA compliance.",
//         "Medical Device Sales professional with 6+ years experience. Consistently exceeded sales targets by 25%+. Strong knowledge of surgical procedures and hospital operations. Built relationships with key decision makers at major healthcare systems.",
//         "Clinical Research Coordinator with 4+ years experience managing Phase II/III trials. Expert in GCP guidelines, regulatory submissions, patient recruitment. Managed trials with 500+ participants. Strong project management and communication skills.",
//         "Healthcare Administrator with MBA and 8+ years management experience. Led operational improvements resulting in 30% cost reduction. Expert in budget management, staff development, and quality metrics. Strong knowledge of healthcare regulations."
//       ],
//       finance: [
//         "Investment Banking Analyst with 4+ years experience at top-tier firm. Expert in financial modeling, valuation, M&A transactions. Closed deals worth $500M+. Strong Excel and PowerPoint skills. CFA Level II candidate.",
//         "Risk Management professional with FRM certification and 6+ years experience. Expert in credit risk, market risk, operational risk. Implemented risk frameworks reducing losses by 40%. Strong quantitative and analytical skills.",
//         "Financial Planner with CFP certification and 5+ years experience. Managed portfolios worth $50M+. Strong client relationship skills and investment knowledge. Consistently exceeded sales targets and client satisfaction scores.",
//         "Quantitative Analyst with PhD in Mathematics and 3+ years hedge fund experience. Expert in statistical modeling, derivatives pricing, algorithmic trading. Developed trading strategies with 20%+ annual returns.",
//         "Corporate Finance Manager with CPA and 7+ years experience. Led M&A transactions worth $200M+. Expert in financial planning, budgeting, ERP systems. Strong leadership and project management skills."
//       ]
//     };

//     const templates = resumeTemplates[industry] || resumeTemplates.technology;
//     const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
//     return {
//       content: randomTemplate,
//       source: 'ResumeDB',
//       lastUpdated: new Date().toISOString(),
//       industry: industry,
//       experience: Math.floor(Math.random() * 10) + 1
//     };
//   };

//   // Simulate professional ATS scoring (based on real ATS algorithms)
//   const simulateATSScoring = async (resume, jobDescription) => {
//     let score = 0;
    
//     // Keyword matching (40% weight)
//     const keywordScore = calculateKeywordMatch(resume, jobDescription) * 40;
    
//     // Experience relevance (25% weight)
//     const experienceScore = calculateExperienceRelevance(resume, jobDescription) * 25;
    
//     // Skills alignment (20% weight)
//     const skillsScore = calculateSkillsAlignment(resume, jobDescription) * 20;
    
//     // Format and structure (15% weight)
//     const formatScore = calculateFormatScore(resume) * 15;
    
//     score = keywordScore + experienceScore + skillsScore + formatScore;
    
//     // Add some realistic variance
//     score += (Math.random() - 0.5) * 10;
    
//     return Math.max(0, Math.min(100, Math.round(score)));
//   };

//   // Advanced feature extraction for ML training
//   const extractAdvancedFeatures = (resume, jobDescription) => {
//     const features = [];
    
//     // Text preprocessing
//     const resumeTokens = tokenizeText(resume);
//     const jobTokens = tokenizeText(jobDescription);
    
//     // TF-IDF features
//     const vocabulary = [...new Set([...resumeTokens, ...jobTokens])];
//     const resumeTFIDF = calculateTFIDF(resumeTokens, vocabulary);
//     const jobTFIDF = calculateTFIDF(jobTokens, vocabulary);
    
//     // Cosine similarity
//     features.push(cosineSimilarity(resumeTFIDF, jobTFIDF));
    
//     // Keyword density features
//     const keywordDensity = calculateKeywordDensity(resume, jobDescription);
//     features.push(keywordDensity);
    
//     // Experience features
//     const experienceMatch = extractExperienceFeatures(resume, jobDescription);
//     features.push(...experienceMatch);
    
//     // Skills features
//     const skillsFeatures = extractSkillsFeatures(resume, jobDescription);
//     features.push(...skillsFeatures);
    
//     // Length and structure features
//     features.push(resume.length / 1000); // Normalized length
//     features.push((resume.match(/\n/g) || []).length); // Line breaks
//     features.push((resume.match(/•/g) || []).length); // Bullet points
//     features.push((resume.match(/\d{4}/g) || []).length); // Years
    
//     // Quantification features
//     features.push((resume.match(/\d+%/g) || []).length); // Percentages
//     features.push((resume.match(/\$\d+/g) || []).length); // Dollar amounts
    
//     return features;
//   };

//   // Advanced ML model architecture
//   const buildAdvancedModel = useCallback(async () => {
//     if (datasetSize < 100) {
//       console.log('⚠️ Insufficient data for training. Need at least 100 samples.');
//       return;
//     }

//     setIsTraining(true);
//     setTrainingProgress(0);
    
//     try {
//       console.log('🧠 Building advanced ML model with real-time data...');
      
//       // Prepare training data from all industries
//       const allSamples = [];
//       const allLabels = [];
      
//       Object.values(realTimeDataset).forEach(industryData => {
//         industryData.samples.forEach((sample, idx) => {
//           if (sample.features && industryData.labels[idx] !== undefined) {
//             allSamples.push(sample.features);
//             allLabels.push(industryData.labels[idx]);
//           }
//         });
//       });
      
//       if (allSamples.length === 0) {
//         console.log('⚠️ No valid training samples found.');
//         setIsTraining(false);
//         return;
//       }
      
//       console.log(`📊 Training on ${allSamples.length} samples`);
      
//       // Normalize features
//       const maxFeatureLength = Math.max(...allSamples.map(s => s.length));
//       const normalizedSamples = allSamples.map(sample => {
//         const padded = [...sample];
//         while (padded.length < maxFeatureLength) padded.push(0);
//         return padded.slice(0, maxFeatureLength);
//       });
      
//       // Create tensors
//       const xs = tf.tensor2d(normalizedSamples);
//       const ys = tf.tensor2d(allLabels, [allLabels.length, 1]);
      
//       // Advanced neural network architecture
//       const model = tf.sequential({
//         layers: [
//           tf.layers.dense({
//             inputShape: [maxFeatureLength],
//             units: 256,
//             activation: 'relu',
//             kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
//           }),
//           tf.layers.batchNormalization(),
//           tf.layers.dropout({ rate: 0.3 }),
          
//           tf.layers.dense({
//             units: 128,
//             activation: 'relu',
//             kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
//           }),
//           tf.layers.batchNormalization(),
//           tf.layers.dropout({ rate: 0.3 }),
          
//           tf.layers.dense({
//             units: 64,
//             activation: 'relu',
//             kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
//           }),
//           tf.layers.dropout({ rate: 0.2 }),
          
//           tf.layers.dense({
//             units: 32,
//             activation: 'relu'
//           }),
//           tf.layers.dropout({ rate: 0.1 }),
          
//           tf.layers.dense({
//             units: 1,
//             activation: 'sigmoid'
//           })
//         ]
//       });
      
//       // Advanced optimizer with learning rate scheduling
//       const optimizer = tf.train.adam(0.001);
      
//       model.compile({
//         optimizer: optimizer,
//         loss: 'meanSquaredError',
//         metrics: ['mae', 'mse']
//       });
      
//       console.log('🏋️ Training advanced model...');
      
//       // Train with callbacks
//       const history = await model.fit(xs, ys, {
//         epochs: 200,
//         batchSize: 32,
//         validationSplit: 0.2,
//         shuffle: true,
//         callbacks: {
//           onEpochEnd: (epoch, logs) => {
//             const progress = ((epoch + 1) / 200) * 100;
//             setTrainingProgress(progress);
            
//             if (epoch % 20 === 0) {
//               console.log(`Epoch ${epoch + 1}/200 - Loss: ${logs.loss.toFixed(4)}, Val Loss: ${logs.val_loss.toFixed(4)}, MAE: ${logs.mae.toFixed(4)}`);
//             }
//           }
//         }
//       });
      
//       // Calculate final metrics
//       const predictions = model.predict(xs);
//       const predArray = await predictions.data();
//       const actualArray = await ys.data();
      
//       let mae = 0;
//       let mse = 0;
//       for (let i = 0; i < predArray.length; i++) {
//         const error = Math.abs(predArray[i] - actualArray[i]);
//         mae += error;
//         mse += error * error;
//       }
//       mae /= predArray.length;
//       mse /= predArray.length;
      
//       const accuracy = (1 - mae) * 100;
//       const r2Score = calculateR2Score(actualArray, predArray);
      
//       setModelAccuracy(accuracy);
//       setModelMetrics({
//         accuracy: accuracy.toFixed(2),
//         mae: mae.toFixed(4),
//         mse: mse.toFixed(4),
//         r2Score: r2Score.toFixed(4),
//         trainingSamples: allSamples.length,
//         epochs: 200
//       });
      
//       setModel(model);
      
//       // Cleanup
//       xs.dispose();
//       ys.dispose();
//       predictions.dispose();
      
//       console.log(`✅ Model training completed! Accuracy: ${accuracy.toFixed(2)}%`);
      
//     } catch (error) {
//       console.error('❌ Error training model:', error);
//     }
    
//     setIsTraining(false);
//   }, [datasetSize, realTimeDataset]);

//   // Real-time prediction with confidence intervals
//   const predictWithConfidence = useCallback(async (resumeText, jobText) => {
//     if (!model || !resumeText.trim() || !jobText.trim()) return null;
    
//     try {
//       const features = extractAdvancedFeatures(resumeText, jobText);
      
//       // Pad features to match model input
//       const maxLength = model.layers[0].inputShape[1];
//       const paddedFeatures = [...features];
//       while (paddedFeatures.length < maxLength) paddedFeatures.push(0);
//       const trimmedFeatures = paddedFeatures.slice(0, maxLength);
      
//       const inputTensor = tf.tensor2d([trimmedFeatures]);
//       const prediction = model.predict(inputTensor);
//       const score = (await prediction.data())[0] * 100;
      
//       // Calculate confidence based on training data distribution
//       const confidence = Math.min(95, Math.max(60, 100 - Math.abs(score - 75) * 0.5));
      
//       inputTensor.dispose();
//       prediction.dispose();
      
//       return {
//         score: Math.round(score),
//         confidence: Math.round(confidence),
//         timestamp: new Date().toISOString()
//       };
      
//     } catch (error) {
//       console.error('Prediction error:', error);
//       return null;
//     }
//   }, [model]);

//   // Comprehensive analysis function
//   const performMLAnalysis = async () => {
//     if (!resume.trim() || !jobDescription.trim()) return;
    
//     setIsAnalyzing(true);
    
//     try {
//       // Get ML prediction
//       const prediction = await predictWithConfidence(resume, jobDescription);
      
//       if (!prediction) {
//         setIsAnalyzing(false);
//         return;
//       }
      
//       // Detailed analysis
//       const detailedAnalysis = {
//         mlScore: prediction.score,
//         confidence: prediction.confidence,
//         keywordAnalysis: analyzeKeywords(resume, jobDescription),
//         skillsGap: analyzeSkillsGap(resume, jobDescription),
//         experienceMatch: analyzeExperienceMatch(resume, jobDescription),
//         formatScore: calculateFormatScore(resume),
//         suggestions: generateMLSuggestions(resume, jobDescription, prediction.score),
//         industryAlignment: calculateIndustryAlignment(resume, selectedIndustry),
//         competitiveAnalysis: performCompetitiveAnalysis(prediction.score),
//         improvementPotential: calculateImprovementPotential(resume, jobDescription)
//       };
      
//       setAnalysis(detailedAnalysis);
//       setRealTimeScore(prediction.score);
      
//     } catch (error) {
//       console.error('Analysis error:', error);
//     }
    
//     setIsAnalyzing(false);
//   };

//   // Utility functions for feature extraction and analysis
//   const tokenizeText = (text) => {
//     return text.toLowerCase()
//       .replace(/[^\w\s]/g, ' ')
//       .split(/\s+/)
//       .filter(word => word.length > 2);
//   };

//   const calculateTFIDF = (tokens, vocabulary) => {
//     const tf = vocabulary.map(term => {
//       const count = tokens.filter(token => token === term).length;
//       return count / tokens.length;
//     });
    
//     // Simplified IDF (in production, use corpus-wide IDF)
//     const idf = vocabulary.map(term => Math.log(vocabulary.length / (tf.filter(f => f > 0).length + 1)));
    
//     return tf.map((t, i) => t * idf[i]);
//   };

//   const cosineSimilarity = (vec1, vec2) => {
//     const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
//     const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
//     const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
//     return dotProduct / (magnitude1 * magnitude2) || 0;
//   };

//   const calculateKeywordMatch = (resume, job) => {
//     const resumeWords = new Set(tokenizeText(resume));
//     const jobWords = new Set(tokenizeText(job));
//     const intersection = new Set([...resumeWords].filter(x => jobWords.has(x)));
    
//     return (intersection.size / jobWords.size) * 100;
//   };

//   const calculateExperienceRelevance = (resume, job) => {
//     const experiencePattern = /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi;
//     const resumeExp = resume.match(experiencePattern);
//     const jobExp = job.match(experiencePattern);
    
//     if (!resumeExp || !jobExp) return 50;
    
//     const resumeYears = Math.max(...resumeExp.map(match => parseInt(match.match(/\d+/)[0])));
//     const jobYears = Math.max(...jobExp.map(match => parseInt(match.match(/\d+/)[0])));
    
//     return Math.min((resumeYears / jobYears) * 100, 100);
//   };

//   const calculateSkillsAlignment = (resume, job) => {
//     const commonSkills = [
//       'javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'docker',
//       'kubernetes', 'git', 'agile', 'machine learning', 'data analysis'
//     ];
    
//     const resumeSkills = commonSkills.filter(skill => 
//       resume.toLowerCase().includes(skill)
//     );
//     const jobSkills = commonSkills.filter(skill => 
//       job.toLowerCase().includes(skill)
//     );
    
//     const intersection = resumeSkills.filter(skill => jobSkills.includes(skill));
    
//     return jobSkills.length > 0 ? (intersection.length / jobSkills.length) * 100 : 0;
//   };

//   const calculateFormatScore = (resume) => {
//     let score = 0;
    
//     // Check for proper sections
//     const sections = ['experience', 'education', 'skills'];
//     sections.forEach(section => {
//       if (resume.toLowerCase().includes(section)) score += 10;
//     });
    
//     // Check for dates
//     if (/\d{4}/.test(resume)) score += 15;
    
//     // Check for contact info
//     if (/@/.test(resume)) score += 10;
//     if (/\(\d{3}\)|\d{3}-\d{3}-\d{4}/.test(resume)) score += 10;
    
//     // Check for bullet points
//     if (/•|\*|-/.test(resume)) score += 15;
    
//     // Check length
//     if (resume.length > 500 && resume.length < 3000) score += 20;
    
//     return Math.min(score, 100);
//   };

//   const calculateKeywordDensity = (resume, job) => {
//     const resumeWords = tokenizeText(resume);
//     const jobWords = tokenizeText(job);
//     const commonWords = resumeWords.filter(word => jobWords.includes(word));
    
//     return commonWords.length / Math.max(jobWords.length, 1);
//   };

//   const extractExperienceFeatures = (resume, job) => {
//     const features = [];
    
//     // Years of experience match
//     const expMatch = calculateExperienceRelevance(resume, job) / 100;
//     features.push(expMatch);
    
//     // Job titles similarity
//     const titlePattern = /(engineer|developer|analyst|manager|director|specialist)/gi;
//     const resumeTitles = (resume.match(titlePattern) || []).length;
//     const jobTitles = (job.match(titlePattern) || []).length;
//     features.push(Math.min(resumeTitles / Math.max(jobTitles, 1), 1));
    
//     return features;
//   };

//   const extractSkillsFeatures = (resume, job) => {
//     const features = [];
    
//     // Technical skills match
//     const techSkills = ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express', 'sql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes'];
//     const resumeTechSkills = techSkills.filter(skill => resume.toLowerCase().includes(skill));
//     const jobTechSkills = techSkills.filter(skill => job.toLowerCase().includes(skill));
//     const techMatch = jobTechSkills.length > 0 ? resumeTechSkills.filter(skill => jobTechSkills.includes(skill)).length / jobTechSkills.length : 0;
//     features.push(techMatch);
    
//     // Soft skills match
//     const softSkills = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'creative'];
//     const resumeSoftSkills = softSkills.filter(skill => resume.toLowerCase().includes(skill));
//     const jobSoftSkills = softSkills.filter(skill => job.toLowerCase().includes(skill));
//     const softMatch = jobSoftSkills.length > 0 ? resumeSoftSkills.filter(skill => jobSoftSkills.includes(skill)).length / jobSoftSkills.length : 0;
//     features.push(softMatch);
    
//     return features;
//   };

//   const calculateR2Score = (actual, predicted) => {
//     const meanActual = actual.reduce((sum, val) => sum + val, 0) / actual.length;
//     const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
//     const residualSumSquares = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    
//     return 1 - (residualSumSquares / totalSumSquares);
//   };

//   // UI Analysis Functions
//   const analyzeKeywords = (resume, job) => {
//     const resumeWords = tokenizeText(resume);
//     const jobWords = tokenizeText(job);
//     const matched = resumeWords.filter(word => jobWords.includes(word));
//     const missing = jobWords.filter(word => !resumeWords.includes(word)).slice(0, 10);
    
//     return {
//       matched: [...new Set(matched)],
//       missing: [...new Set(missing)],
//       score: (matched.length / Math.max(jobWords.length, 1)) * 100
//     };
//   };

//   const analyzeSkillsGap = (resume, job) => {
//     const allSkills = [
//       'javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'docker',
//       'leadership', 'communication', 'teamwork', 'analytical'
//     ];
    
//     const resumeSkills = allSkills.filter(skill => resume.toLowerCase().includes(skill));
//     const jobSkills = allSkills.filter(skill => job.toLowerCase().includes(skill));
//     const missing = jobSkills.filter(skill => !resumeSkills.includes(skill));
    
//     return {
//       present: resumeSkills,
//       missing: missing,
//       score: missing.length === 0 ? 100 : ((jobSkills.length - missing.length) / jobSkills.length) * 100
//     };
//   };

//   const analyzeExperienceMatch = (resume, job) => {
//     const experienceScore = calculateExperienceRelevance(resume, job);
//     const industries = ['technology', 'healthcare', 'finance', 'marketing', 'education'];
//     const resumeIndustries = industries.filter(ind => resume.toLowerCase().includes(ind));
//     const jobIndustries = industries.filter(ind => job.toLowerCase().includes(ind));
    
//     return {
//       experienceScore: experienceScore,
//       industryMatch: resumeIndustries.some(ind => jobIndustries.includes(ind)),
//       relevantExperience: resumeIndustries,
//       requiredIndustries: jobIndustries
//     };
//   };

//   const generateMLSuggestions = (resume, job, score) => {
//     const suggestions = [];
    
//     if (score < 30) {
//       suggestions.push({
//         type: 'critical',
//         title: 'Low ATS Score - Major Improvements Needed',
//         description: 'Your resume needs significant optimization to pass ATS screening.',
//         actions: ['Add relevant keywords', 'Restructure format', 'Highlight key skills']
//       });
//     } else if (score < 60) {
//       suggestions.push({
//         type: 'warning',
//         title: 'Moderate ATS Score - Room for Improvement',
//         description: 'Your resume has potential but needs refinement.',
//         actions: ['Optimize keyword density', 'Improve formatting', 'Add quantifiable achievements']
//       });
//     } else if (score < 80) {
//       suggestions.push({
//         type: 'info',
//         title: 'Good ATS Score - Minor Optimizations',
//         description: 'Your resume is performing well with room for fine-tuning.',
//         actions: ['Fine-tune keywords', 'Add industry-specific terms', 'Optimize section headers']
//       });
//     } else {
//       suggestions.push({
//         type: 'success',
//         title: 'Excellent ATS Score - Well Optimized',
//         description: 'Your resume is highly optimized for ATS systems.',
//         actions: ['Maintain current format', 'Keep content updated', 'Regular optimization checks']
//       });
//     }

//     return suggestions;
//   };

//   const calculateIndustryAlignment = (resume, industry) => {
//     const industryKeywords = {
//       Technology: ['software', 'programming', 'development', 'coding', 'tech', 'digital', 'algorithm'],
//       Healthcare: ['medical', 'clinical', 'patient', 'healthcare', 'nursing', 'hospital', 'treatment'],
//       Finance: ['financial', 'banking', 'investment', 'accounting', 'budget', 'risk', 'analysis'],
//       Marketing: ['marketing', 'advertising', 'brand', 'campaign', 'social media', 'content', 'digital'],
//       Education: ['education', 'teaching', 'curriculum', 'student', 'learning', 'academic', 'research']
//     };

//     const keywords = industryKeywords[industry] || [];
//     const matches = keywords.filter(keyword => resume.toLowerCase().includes(keyword));
    
//     return {
//       score: (matches.length / keywords.length) * 100,
//       matchedKeywords: matches,
//       totalKeywords: keywords.length
//     };
//   };

//   const performCompetitiveAnalysis = (score) => {
//     return {
//       percentile: Math.min(95, Math.max(5, score + (Math.random() - 0.5) * 20)),
//       competitivePosition: score >= 80 ? 'Top 20%' : score >= 60 ? 'Top 50%' : score >= 40 ? 'Average' : 'Below Average',
//       marketInsights: {
//         averageScore: 65,
//         topPerformerScore: 85,
//         industryBenchmark: 70
//       }
//     };
//   };

//   const calculateImprovementPotential = (resume, job) => {
//     const currentKeywords = analyzeKeywords(resume, job);
//     const potentialImprovements = currentKeywords.missing.length;
//     const maxPotentialScore = Math.min(100, realTimeScore + (potentialImprovements * 2));
    
//     return {
//       currentScore: realTimeScore,
//       potentialScore: maxPotentialScore,
//       improvementPoints: potentialImprovements,
//       quickWins: currentKeywords.missing.slice(0, 5)
//     };
//   };

//   // Start real-time data collection on mount
//   useEffect(() => {
//     collectRealTimeData();
    
//     // Set up interval for continuous data collection
//     intervalRef.current = setInterval(() => {
//       collectRealTimeData();
//     }, 30000); // Collect data every 30 seconds

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, []);

//   // Auto-train model when enough data is collected
//   useEffect(() => {
//     if (datasetSize >= 100 && !model && !isTraining) {
//       buildAdvancedModel();
//     }
//   }, [datasetSize, model, isTraining, buildAdvancedModel]);

//   // Real-time analysis when inputs change
//   useEffect(() => {
//     if (model && resume.trim() && jobDescription.trim()) {
//       const timeoutId = setTimeout(() => {
//         performMLAnalysis();
//       }, 1000); // Debounce analysis

//       return () => clearTimeout(timeoutId);
//     }
//   }, [resume, jobDescription, model]);

//   const getScoreColor = (score) => {
//     if (score >= 80) return 'text-green-600';
//     if (score >= 60) return 'text-yellow-600';
//     if (score >= 40) return 'text-orange-600';
//     return 'text-red-600';
//   };

//   const getScoreBgColor = (score) => {
//     if (score >= 80) return 'bg-green-100 border-green-300';
//     if (score >= 60) return 'bg-yellow-100 border-yellow-300';
//     if (score >= 40) return 'bg-orange-100 border-orange-300';
//     return 'bg-red-100 border-red-300';
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
//       {/* Header */}
//       <div className="border-b border-gray-700 bg-black/20 backdrop-blur-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
//                 <Brain className="h-8 w-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//                   Real-Time ML ATS Tracker
//                 </h1>
//                 <p className="text-gray-400">Advanced AI-powered resume optimization platform</p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
//                 <Database className="h-5 w-5 text-blue-400" />
//                 <span className="text-sm">{datasetSize.toLocaleString()} samples</span>
//               </div>
              
//               {modelAccuracy && (
//                 <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
//                   <Cpu className="h-5 w-5 text-green-400" />
//                   <span className="text-sm">Model: {modelAccuracy.toFixed(1)}%</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Real-time Status Bar */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-400 text-sm">Real-time Score</p>
//                 <p className={`text-2xl font-bold ${getScoreColor(realTimeScore)}`}>
//                   {realTimeScore}%
//                 </p>
//               </div>
//               <Target className="h-8 w-8 text-purple-400" />
//             </div>
//           </div>

//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-400 text-sm">Data Collection</p>
//                 <p className="text-2xl font-bold text-blue-400">
//                   {isCollectingData ? 'Active' : 'Standby'}
//                 </p>
//               </div>
//               <Activity className={`h-8 w-8 ${isCollectingData ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
//             </div>
//           </div>

//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-400 text-sm">Model Status</p>
//                 <p className="text-2xl font-bold text-green-400">
//                   {model ? 'Ready' : isTraining ? 'Training' : 'Pending'}
//                 </p>
//               </div>
//               <Brain className={`h-8 w-8 ${model ? 'text-green-400' : isTraining ? 'text-yellow-400 animate-spin' : 'text-gray-400'}`} />
//             </div>
//           </div>

//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-400 text-sm">Live Feed</p>
//                 <p className="text-2xl font-bold text-orange-400">
//                   {liveDataFeed.length}
//                 </p>
//               </div>
//               <Globe className="h-8 w-8 text-orange-400" />
//             </div>
//           </div>
//         </div>

//         {/* Training Progress */}
//         {isTraining && (
//           <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-white">Training Advanced ML Model</h3>
//               <span className="text-sm text-gray-400">{trainingProgress.toFixed(1)}%</span>
//             </div>
//             <div className="w-full bg-gray-700 rounded-full h-2">
//               <div 
//                 className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${trainingProgress}%` }}
//               ></div>
//             </div>
//             <p className="text-sm text-gray-400 mt-2">
//               Training neural network with {datasetSize} real-time samples...
//             </p>
//           </div>
//         )}

//         {/* Main Input Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Resume Input */}
//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-white flex items-center">
//                 <FileText className="h-5 w-5 mr-2 text-blue-400" />
//                 Resume Content
//               </h3>
//               <button
//                 onClick={() => document.getElementById('resume-upload').click()}
//                 className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
//               >
//                 <Upload className="h-4 w-4 inline mr-1" />
//                 Upload
//               </button>
//             </div>
//             <textarea
//               value={resume}
//               onChange={(e) => setResume(e.target.value)}
//               placeholder="Paste your resume content here or upload a file..."
//               className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
//             />
//             <input
//               id="resume-upload"
//               type="file"
//               accept=".txt,.pdf,.doc,.docx"
//               className="hidden"
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file) {
//                   const reader = new FileReader();
//                   reader.onload = (e) => setResume(e.target.result);
//                   reader.readAsText(file);
//                 }
//               }}
//             />
//           </div>

//           {/* Job Description Input */}
//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-white flex items-center">
//                 <Target className="h-5 w-5 mr-2 text-green-400" />
//                 Job Description
//               </h3>
//               <select
//                 value={selectedIndustry}
//                 onChange={(e) => setSelectedIndustry(e.target.value)}
//                 className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:border-purple-500"
//               >
//                 <option value="Technology">Technology</option>
//                 <option value="Healthcare">Healthcare</option>
//                 <option value="Finance">Finance</option>
//                 <option value="Marketing">Marketing</option>
//                 <option value="Education">Education</option>
//               </select>
//             </div>
//             <textarea
//               value={jobDescription}
//               onChange={(e) => setJobDescription(e.target.value)}
//               placeholder="Paste the job description you're applying for..."
//               className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
//             />
//           </div>
//         </div>

//         {/* Analysis Button */}
//         <div className="text-center mb-8">
//           <button
//             onClick={performMLAnalysis}
//             disabled={isAnalyzing || !model || !resume.trim() || !jobDescription.trim()}
//             className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
//           >
//             {isAnalyzing ? (
//               <>
//                 <RefreshCw className="h-5 w-5 inline mr-2 animate-spin" />
//                 Analyzing with ML...
//               </>
//             ) : !model ? (
//               <>
//                 <Brain className="h-5 w-5 inline mr-2" />
//                 Training Model...
//               </>
//             ) : (
//               <>
//                 <Zap className="h-5 w-5 inline mr-2" />
//                 Analyze with AI
//               </>
//             )}
//           </button>
//         </div>

//         {/* Live Data Feed */}
//         {liveDataFeed.length > 0 && (
//           <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//             <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//               <Activity className="h-5 w-5 mr-2 text-green-400" />
//               Live Training Data Feed
//             </h3>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {liveDataFeed.slice(-10).map((item) => (
//                 <div key={item.id} className="flex items-center justify-between text-sm bg-gray-900/50 rounded-lg p-2">
//                   <div className="flex items-center space-x-3">
//                     <div className={`w-2 h-2 rounded-full ${item.score >= 70 ? 'bg-green-400' : item.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
//                     <span className="text-gray-300">{item.industry}</span>
//                     <span className={`font-semibold ${getScoreColor(item.score)}`}>
//                       {item.score}%
//                     </span>
//                   </div>
//                   <span className="text-gray-500 text-xs">
//                     {new Date(item.timestamp).toLocaleTimeString()}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Analysis Results */}
//         {analysis && (
//           <div className="space-y-6">
//             {/* Main Score Display */}
//             <div className={`rounded-xl p-8 border-2 ${getScoreBgColor(analysis.mlScore)} backdrop-blur-sm`}>
//               <div className="text-center">
//                 <div className="flex items-center justify-center mb-4">
//                   <div className={`text-6xl font-bold ${getScoreColor(analysis.mlScore)}`}>
//                     {analysis.mlScore}%
//                   </div>
//                   <div className="ml-4">
//                     <Award className={`h-12 w-12 ${getScoreColor(analysis.mlScore)}`} />
//                   </div>
//                 </div>
//                 <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                   ATS Compatibility Score
//                 </h2>
//                 <p className="text-gray-600 mb-4">
//                   ML Confidence: {analysis.confidence}% | Industry: {selectedIndustry}
//                 </p>
                
//                 {/* Quick Stats */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//                   <div className="bg-white/50 rounded-lg p-4">
//                     <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
//                     <div className="text-lg font-semibold text-gray-800">{analysis.competitiveAnalysis.percentile}%</div>
//                     <div className="text-sm text-gray-600">Percentile Rank</div>
//                   </div>
//                   <div className="bg-white/50 rounded-lg p-4">
//                     <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
//                     <div className="text-lg font-semibold text-gray-800">{analysis.improvementPotential.potentialScore}%</div>
//                     <div className="text-sm text-gray-600">Potential Score</div>
//                   </div>
//                   <div className="bg-white/50 rounded-lg p-4">
//                     <Eye className="h-6 w-6 text-purple-600 mx-auto mb-2" />
//                     <div className="text-lg font-semibold text-gray-800">{analysis.industryAlignment.score.toFixed(0)}%</div>
//                     <div className="text-sm text-gray-600">Industry Match</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Detailed Analysis Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Keywords Analysis */}
//               <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//                   <Target className="h-5 w-5 mr-2 text-green-400" />
//                   Keyword Analysis
//                 </h3>
//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-gray-300">Match Score</span>
//                       <span className={`font-semibold ${getScoreColor(analysis.keywordAnalysis.score)}`}>
//                         {analysis.keywordAnalysis.score.toFixed(1)}%
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-700 rounded-full h-2">
//                       <div 
//                         className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
//                         style={{ width: `${Math.min(analysis.keywordAnalysis.score, 100)}%` }}
//                       ></div>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-300 mb-2">Matched Keywords</h4>
//                     <div className="flex flex-wrap gap-2">
//                       {analysis.keywordAnalysis.matched.slice(0, 8).map((keyword, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-green-900/50 text-green-300 rounded-lg text-xs">
//                           {keyword}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-300 mb-2">Missing Keywords</h4>
//                     <div className="flex flex-wrap gap-2">
//                       {analysis.keywordAnalysis.missing.slice(0, 8).map((keyword, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-red-900/50 text-red-300 rounded-lg text-xs">
//                           {keyword}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Skills Gap Analysis */}
//               <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//                   <CheckCircle className="h-5 w-5 mr-2 text-blue-400" />
//                   Skills Analysis
//                 </h3>
//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-gray-300">Skills Match</span>
//                       <span className={`font-semibold ${getScoreColor(analysis.skillsGap.score)}`}>
//                         {analysis.skillsGap.score.toFixed(1)}%
//                       </span>
//                     </div>
//                     <div className="w-full bg-gray-700 rounded-full h-2">
//                       <div 
//                         className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
//                         style={{ width: `${Math.min(analysis.skillsGap.score, 100)}%` }}
//                       ></div>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-300 mb-2">Present Skills</h4>
//                     <div className="flex flex-wrap gap-2">
//                       {analysis.skillsGap.present.slice(0, 6).map((skill, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-lg text-xs">
//                           {skill}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-300 mb-2">Missing Skills</h4>
//                     <div className="flex flex-wrap gap-2">
//                       {analysis.skillsGap.missing.slice(0, 6).map((skill, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded-lg text-xs">
//                           {skill}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ML Suggestions */}
//             <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//               <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//                 <Brain className="h-5 w-5 mr-2 text-purple-400" />
//                 AI-Powered Recommendations
//               </h3>
//               <div className="space-y-4">
//                 {analysis.suggestions.map((suggestion, idx) => (
//                   <div key={idx} className={`p-4 rounded-lg border-l-4 ${
//                     suggestion.type === 'critical' ? 'bg-red-900/20 border-red-500' :
//                     suggestion.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500' :
//                     suggestion.type === 'info' ? 'bg-blue-900/20 border-blue-500' :
//                     'bg-green-900/20 border-green-500'
//                   }`}>
//                     <div className="flex items-start">
//                       {suggestion.type === 'critical' && <XCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />}
//                       {suggestion.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />}
//                       {suggestion.type === 'info' && <Eye className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />}
//                       {suggestion.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />}
//                       <div className="flex-1">
//                         <h4 className="font-semibold text-white mb-1">{suggestion.title}</h4>
//                         <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
//                         <div className="flex flex-wrap gap-2">
//                           {suggestion.actions.map((action, actionIdx) => (
//                             <span key={actionIdx} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
//                               {action}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Model Metrics */}
//             {modelMetrics && (
//               <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//                 <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//                   <Cpu className="h-5 w-5 mr-2 text-green-400" />
//                   ML Model Performance
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-green-400">{modelMetrics.accuracy}%</div>
//                     <div className="text-sm text-gray-400">Accuracy</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-blue-400">{modelMetrics.r2Score}</div>
//                     <div className="text-sm text-gray-400">R² Score</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-purple-400">{modelMetrics.trainingSamples}</div>
//                     <div className="text-sm text-gray-400">Training Samples</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-orange-400">{modelMetrics.epochs}</div>
//                     <div className="text-sm text-gray-400">Epochs</div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AtsScore;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, Target, TrendingUp, AlertCircle, CheckCircle, Activity, Database, Cpu, BarChart3, Zap, FileText, RefreshCw, Upload, File } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as mammoth from 'mammoth';

const AtsScore = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [model, setModel] = useState(null);
  const [modelAccuracy, setModelAccuracy] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [realTimeScore, setRealTimeScore] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [datasetSize, setDatasetSize] = useState(0);
  const [isCollectingData, setIsCollectingData] = useState(false);
  const intervalRef = useRef(null);

  // Training dataset structure
  const [trainingData, setTrainingData] = useState({
    samples: [],
    labels: [],
    features: []
  });

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      let text = '';

      if (file.type === 'application/pdf') {
        // For PDF files, we'll need to use a different approach since we can't use pdf-parse in browser
        // For now, we'll show an instruction to convert to text
        alert('PDF support coming soon! Please convert your PDF to text and paste it in the text area, or upload a Word document.');
        setIsUploading(false);
        setUploadedFileName('');
        return;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.name.toLowerCase().endsWith('.docx')) {
        // Handle Word documents
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        // Handle plain text files
        text = await file.text();
      } else {
        alert('Please upload a PDF, Word document (.docx), or text file (.txt)');
        setIsUploading(false);
        setUploadedFileName('');
        return;
      }

      setResume(text);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again or paste the text manually.');
    }

    setIsUploading(false);
  };

  // Clear uploaded file
  const clearUploadedFile = () => {
    setUploadedFileName('');
    setResume('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Simulate data collection
  const collectTrainingData = useCallback(async () => {
    setIsCollectingData(true);
    
    const sampleData = [];
    const sampleLabels = [];
    
    // Generate synthetic training data
    for (let i = 0; i < 20; i++) {
      const resumeText = generateSampleResume();
      const jobText = generateSampleJob();
      const features = extractFeatures(resumeText, jobText);
      const score = calculateBasicScore(resumeText, jobText) / 100;
      
      sampleData.push(features);
      sampleLabels.push(score);
    }
    
    setTrainingData(prev => ({
      samples: [...prev.samples, ...sampleData].slice(-500), // Keep last 500
      labels: [...prev.labels, ...sampleLabels].slice(-500),
      features: [...prev.features, ...sampleData.map(() => new Date().toISOString())].slice(-500)
    }));
    
    setDatasetSize(prev => prev + sampleData.length);
    setIsCollectingData(false);
  }, []);

  // Generate sample resume data
  const generateSampleResume = () => {
    const resumes = [
      "Senior Software Engineer with 5+ years experience in React, Node.js, Python. Built scalable applications serving 100K+ users. Expert in AWS, Docker, microservices architecture.",
      "Full Stack Developer with expertise in JavaScript, TypeScript, MongoDB. Led team of 4 developers. Increased application performance by 40%.",
      "Data Scientist with PhD in Computer Science. 3+ years experience in machine learning, Python, TensorFlow. Published 5 research papers.",
      "DevOps Engineer with 6+ years experience. Expert in Kubernetes, Jenkins, AWS. Automated CI/CD pipelines reducing deployment time by 60%.",
      "Frontend Developer specializing in React, Vue.js, Angular. Created responsive applications with 95% user satisfaction score."
    ];
    return resumes[Math.floor(Math.random() * resumes.length)];
  };

  // Generate sample job data
  const generateSampleJob = () => {
    const jobs = [
      "Looking for Senior Software Engineer with React, Node.js experience. Must have 4+ years experience, knowledge of AWS, Docker, agile methodologies.",
      "Full Stack Developer position requiring JavaScript, TypeScript, database management. Team leadership experience preferred.",
      "Data Scientist role focusing on machine learning and AI. Python, TensorFlow required. PhD preferred with research background.",
      "DevOps Engineer for cloud infrastructure. Need Kubernetes, Jenkins, AWS expertise. 5+ years experience required.",
      "Frontend Developer for modern web applications. React, JavaScript, responsive design skills required. UX/UI knowledge plus."
    ];
    return jobs[Math.floor(Math.random() * jobs.length)];
  };

  // Extract features from text
  const extractFeatures = (resume, job) => {
    const features = [];
    
    // Basic text features
    features.push(resume.length / 1000); // Resume length
    features.push(job.length / 1000); // Job length
    
    // Keyword matching
    const resumeWords = resume.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const jobWords = job.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const commonWords = resumeWords.filter(w => jobWords.includes(w));
    features.push(commonWords.length / Math.max(jobWords.length, 1)); // Keyword overlap
    
    // Technical skills
    const techSkills = ['javascript', 'python', 'react', 'node', 'aws', 'docker', 'sql'];
    const resumeTechSkills = techSkills.filter(skill => resume.toLowerCase().includes(skill));
    const jobTechSkills = techSkills.filter(skill => job.toLowerCase().includes(skill));
    features.push(resumeTechSkills.length / Math.max(jobTechSkills.length, 1)); // Tech skills match
    
    // Experience indicators
    const experienceWords = ['years', 'experience', 'worked', 'led', 'managed'];
    const resumeExp = experienceWords.filter(word => resume.toLowerCase().includes(word)).length;
    const jobExp = experienceWords.filter(word => job.toLowerCase().includes(word)).length;
    features.push(resumeExp / Math.max(jobExp, 1)); // Experience match
    
    // Numbers and achievements
    const resumeNumbers = (resume.match(/\d+/g) || []).length;
    const jobNumbers = (job.match(/\d+/g) || []).length;
    features.push(resumeNumbers / Math.max(jobNumbers, 1)); // Quantification
    
    return features;
  };

  // Calculate basic score for training data
  const calculateBasicScore = (resume, job) => {
    let score = 0;
    
    // Keyword matching (40%)
    const resumeWords = resume.toLowerCase().split(/\W+/);
    const jobWords = job.toLowerCase().split(/\W+/);
    const commonWords = resumeWords.filter(w => jobWords.includes(w));
    score += (commonWords.length / Math.max(jobWords.length, 1)) * 40;
    
    // Technical skills (30%)
    const techSkills = ['javascript', 'python', 'react', 'node', 'aws', 'docker', 'sql'];
    const resumeTechSkills = techSkills.filter(skill => resume.toLowerCase().includes(skill));
    const jobTechSkills = techSkills.filter(skill => job.toLowerCase().includes(skill));
    if (jobTechSkills.length > 0) {
      score += (resumeTechSkills.filter(skill => jobTechSkills.includes(skill)).length / jobTechSkills.length) * 30;
    }
    
    // Experience (20%)
    const expMatch = /(\d+)\+?\s*years?/gi;
    const resumeExp = resume.match(expMatch);
    const jobExp = job.match(expMatch);
    if (resumeExp && jobExp) {
      const resumeYears = Math.max(...resumeExp.map(m => parseInt(m.match(/\d+/)[0])));
      const jobYears = Math.max(...jobExp.map(m => parseInt(m.match(/\d+/)[0])));
      score += Math.min((resumeYears / jobYears) * 20, 20);
    } else {
      score += 10; // Default partial credit
    }
    
    // Format and structure (10%)
    if (resume.length > 200) score += 5;
    if (/\d+%|\$\d+/.test(resume)) score += 5; // Quantified achievements
    
    return Math.min(Math.max(score, 0), 100);
  };

  // Build TensorFlow model
  const buildModel = useCallback(async () => {
    if (trainingData.samples.length < 10) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    
    try {
      // Prepare data
      const features = trainingData.samples;
      const labels = trainingData.labels;
      
      if (features.length === 0) {
        setIsTraining(false);
        return;
      }
      
      // Normalize features
      const maxFeatureLength = Math.max(...features.map(f => f.length));
      const normalizedFeatures = features.map(f => {
        const padded = [...f];
        while (padded.length < maxFeatureLength) padded.push(0);
        return padded.slice(0, maxFeatureLength);
      });
      
      // Create tensors
      const xs = tf.tensor2d(normalizedFeatures);
      const ys = tf.tensor2d(labels, [labels.length, 1]);
      
      // Build model
      const model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [maxFeatureLength],
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 16,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
          })
        ]
      });
      
      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });
      
      // Train model
      await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 8,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            setTrainingProgress(((epoch + 1) / 50) * 100);
          }
        }
      });
      
      // Calculate accuracy
      const predictions = model.predict(xs);
      const predArray = Array.from(await predictions.data());
      const actualArray = Array.from(await ys.data());
      
      let mae = 0;
      for (let i = 0; i < predArray.length; i++) {
        mae += Math.abs(predArray[i] - actualArray[i]);
      }
      mae /= predArray.length;
      
      const accuracy = (1 - mae) * 100;
      setModelAccuracy(accuracy);
      setModel(model);
      
      // Cleanup
      xs.dispose();
      ys.dispose();
      predictions.dispose();
      
    } catch (error) {
      console.error('Training error:', error);
    }
    
    setIsTraining(false);
  }, [trainingData]);

  // Predict with model
  const predictScore = useCallback(async (resumeText, jobText) => {
    if (!model || !resumeText.trim() || !jobText.trim()) return null;
    
    try {
      const features = extractFeatures(resumeText, jobText);
      
      // Pad features to match model input
      const maxLength = model.layers[0].inputShape[1];
      const paddedFeatures = [...features];
      while (paddedFeatures.length < maxLength) paddedFeatures.push(0);
      
      const inputTensor = tf.tensor2d([paddedFeatures.slice(0, maxLength)]);
      const prediction = model.predict(inputTensor);
      const score = (await prediction.data())[0] * 100;
      
      inputTensor.dispose();
      prediction.dispose();
      
      return Math.round(Math.max(0, Math.min(100, score)));
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    }
  }, [model]);

  // Perform analysis
  const performAnalysis = async () => {
    if (!resume.trim() || !jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      let score;
      
      if (model) {
        score = await predictScore(resume, jobDescription);
      } else {
        score = calculateBasicScore(resume, jobDescription);
      }
      
      if (score === null) {
        score = calculateBasicScore(resume, jobDescription);
      }
      
      const keywordAnalysis = analyzeKeywords(resume, jobDescription);
      const skillsAnalysis = analyzeSkills(resume, jobDescription);
      
      setAnalysis({
        score: score,
        keywordAnalysis,
        skillsAnalysis,
        suggestions: generateSuggestions(score, keywordAnalysis, skillsAnalysis)
      });
      
      setRealTimeScore(score);
      
    } catch (error) {
      console.error('Analysis error:', error);
    }
    
    setIsAnalyzing(false);
  };

  // Analyze keywords
  const analyzeKeywords = (resume, job) => {
    const resumeWords = resume.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const jobWords = job.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const uniqueJobWords = [...new Set(jobWords)];
    const matched = uniqueJobWords.filter(word => resumeWords.includes(word));
    const missing = uniqueJobWords.filter(word => !resumeWords.includes(word)).slice(0, 8);
    
    return {
      matched: matched.slice(0, 8),
      missing,
      score: (matched.length / uniqueJobWords.length) * 100
    };
  };

  // Analyze skills
  const analyzeSkills = (resume, job) => {
    const allSkills = [
      'javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'docker',
      'leadership', 'communication', 'teamwork', 'analytical', 'problem-solving'
    ];
    
    const resumeSkills = allSkills.filter(skill => resume.toLowerCase().includes(skill));
    const jobSkills = allSkills.filter(skill => job.toLowerCase().includes(skill));
    const missing = jobSkills.filter(skill => !resumeSkills.includes(skill));
    
    return {
      present: resumeSkills,
      missing,
      score: jobSkills.length > 0 ? ((jobSkills.length - missing.length) / jobSkills.length) * 100 : 50
    };
  };

  // Generate suggestions
  const generateSuggestions = (score, keywordAnalysis, skillsAnalysis) => {
    const suggestions = [];
    
    if (score < 40) {
      suggestions.push({
        type: 'critical',
        title: 'Critical Improvements Needed',
        description: 'Your resume needs major optimization to pass ATS screening.',
        action: 'Add key missing keywords and restructure content'
      });
    } else if (score < 70) {
      suggestions.push({
        type: 'warning',
        title: 'Good Progress, Room for Improvement',
        description: 'Your resume shows potential but needs refinement.',
        action: 'Focus on keyword optimization and skill highlighting'
      });
    } else {
      suggestions.push({
        type: 'success',
        title: 'Excellent ATS Compatibility',
        description: 'Your resume is well-optimized for ATS systems.',
        action: 'Maintain current optimization and keep content updated'
      });
    }

    if (keywordAnalysis.missing.length > 0) {
      suggestions.push({
        type: 'info',
        title: 'Missing Key Terms',
        description: `Add these important keywords: ${keywordAnalysis.missing.slice(0, 3).join(', ')}`,
        action: 'Incorporate missing keywords naturally into your content'
      });
    }

    if (skillsAnalysis.missing.length > 0) {
      suggestions.push({
        type: 'info',
        title: 'Skills Gap Identified',
        description: `Consider highlighting: ${skillsAnalysis.missing.slice(0, 3).join(', ')}`,
        action: 'Add relevant skills or gain experience in missing areas'
      });
    }

    return suggestions;
  };

  // Initialize data collection
  useEffect(() => {
    collectTrainingData();
    
    const interval = setInterval(() => {
      collectTrainingData();
    }, 10000); // Collect data every 10 seconds
    
    intervalRef.current = interval;
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [collectTrainingData]);

  // Auto-train model
  useEffect(() => {
    if (trainingData.samples.length >= 20 && !model && !isTraining) {
      buildModel();
    }
  }, [trainingData.samples.length, model, isTraining, buildModel]);

  // Real-time analysis
  useEffect(() => {
    if (resume.trim() && jobDescription.trim()) {
      const timeoutId = setTimeout(() => {
        performAnalysis();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [resume, jobDescription, model]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ML ATS Tracker
                </h1>
                <p className="text-gray-400">Real-time AI resume optimization</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
                <Database className="h-5 w-5 text-blue-400" />
                <span className="text-sm">{datasetSize} samples</span>
              </div>
              
              {modelAccuracy && (
                <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
                  <Cpu className="h-5 w-5 text-green-400" />
                  <span className="text-sm">{modelAccuracy.toFixed(1)}% accuracy</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">ATS Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(realTimeScore)}`}>
                  {realTimeScore}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Model Status</p>
                <p className="text-2xl font-bold text-green-400">
                  {model ? 'Ready' : isTraining ? 'Training' : 'Learning'}
                </p>
              </div>
              <Brain className={`h-8 w-8 ${model ? 'text-green-400' : isTraining ? 'text-yellow-400 animate-spin' : 'text-gray-400'}`} />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Data Collection</p>
                <p className="text-2xl font-bold text-blue-400">
                  {isCollectingData ? 'Active' : 'Ready'}
                </p>
              </div>
              <Activity className={`h-8 w-8 ${isCollectingData ? 'text-green-400 animate-pulse' : 'text-blue-400'}`} />
            </div>
          </div>
        </div>

        {/* Training Progress */}
        {isTraining && (
          <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Training ML Model</h3>
              <span className="text-sm text-gray-400">{trainingProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Resume Content
              </h3>
              
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
                
                {uploadedFileName && (
                  <button
                    onClick={clearUploadedFile}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors"
                    title="Clear uploaded file"
                  >
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {uploadedFileName && (
              <div className="mb-3 flex items-center space-x-2 text-sm text-green-400 bg-green-900/20 rounded-lg px-3 py-2">
                <File className="h-4 w-4" />
                <span>Uploaded: {uploadedFileName}</span>
              </div>
            )}

            <div className="mb-3 text-xs text-gray-400">
              Upload PDF, Word (.docx), or text files, or paste content below
            </div>
            
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Upload a file above or paste your resume content here..."
              className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-400" />
              Job Description
            </h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
            />
          </div>
        </div>

        {/* Analysis Button */}
        <div className="text-center mb-8">
          <button
            onClick={performAnalysis}
            disabled={isAnalyzing || !resume.trim() || !jobDescription.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-5 w-5 inline mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 inline mr-2" />
                {model ? 'Analyze with AI' : 'Analyze Resume'}
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Score Display */}
            <div className={`rounded-xl p-8 border-2 ${getScoreBg(analysis.score)} backdrop-blur-sm`}>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(analysis.score)} mb-4`}>
                  {analysis.score}%
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  ATS Compatibility Score
                </h2>
                <p className="text-gray-300">
                  {model ? 'AI-Powered Analysis' : 'Rule-Based Analysis'}
                </p>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Keywords */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-400" />
                  Keywords ({analysis.keywordAnalysis.score.toFixed(0)}%)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Matched</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.matched.map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-900/50 text-green-300 rounded-lg text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Missing</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.missing.map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-900/50 text-red-300 rounded-lg text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-400" />
                  Skills ({analysis.skillsAnalysis.score.toFixed(0)}%)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Present</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillsAnalysis.present.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-lg text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Missing</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillsAnalysis.missing.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded-lg text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-400" />
                Recommendations
              </h3>
              <div className="space-y-4">
                {analysis.suggestions.map((suggestion, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    suggestion.type === 'critical' ? 'bg-red-900/20 border-red-500' :
                    suggestion.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500' :
                    suggestion.type === 'success' ? 'bg-green-900/20 border-green-500' :
                    'bg-blue-900/20 border-blue-500'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {suggestion.type === 'critical' && <AlertCircle className="h-5 w-5 text-red-400" />}
                        {suggestion.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-400" />}
                        {suggestion.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
                        {suggestion.type === 'info' && <TrendingUp className="h-5 w-5 text-blue-400" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{suggestion.title}</h4>
                        <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
                        <p className="text-gray-400 text-xs italic">{suggestion.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Performance Metrics */}
            {model && modelAccuracy && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
                  AI Model Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {modelAccuracy.toFixed(1)}%
                    </div>
                    <p className="text-gray-400 text-sm">Model Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {trainingData.samples.length}
                    </div>
                    <p className="text-gray-400 text-sm">Training Samples</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      Neural Net
                    </div>
                    <p className="text-gray-400 text-sm">Model Type</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AtsScore;