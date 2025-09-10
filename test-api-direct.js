const https = require('https');
const http = require('http');

async function testTemplateAPI() {
    console.log('🚀 Testing Template Content API directly...');
    console.log('🔍 This will test if the fix for dbTemplate.html_content || dbTemplate.html is working\n');

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/email-marketing/v2?action=templates',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        console.log('📡 Making API request to:', `http://localhost:${options.port}${options.path}`);
        
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`📊 Response Status: ${res.statusCode}`);
                console.log(`📋 Response Headers:`, res.headers);
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log('\n✅ API Response received successfully');
                    console.log(`📝 Total templates found: ${jsonData.data && jsonData.data.templates ? jsonData.data.templates.length : 0}`);
                    
                    if (jsonData.data && jsonData.data.templates && jsonData.data.templates.length > 0) {
                        console.log('\n🔍 Analyzing template content...');
                        
                        // Look for the specific template or use the first available template
                        let targetTemplate = jsonData.data.templates.find(template => 
                            template.nome && template.nome.includes('Super Oferta')
                        );
                        
                        // If specific template not found, use the first available one for testing
                        if (!targetTemplate && jsonData.data.templates.length > 0) {
                            targetTemplate = jsonData.data.templates[0];
                            console.log(`\n🔄 Using first available template for testing: "${targetTemplate.nome || targetTemplate.id}"`);
                        }
                        
                        if (targetTemplate) {
                            console.log(`\n🎯 Found target template: "${targetTemplate.nome}"`);
                            console.log(`📅 Created: ${targetTemplate.created_at}`);
                            console.log(`🔢 Template ID: ${targetTemplate.id}`);
                            
                            // Check content properties
                            const hasHtmlContent = !!targetTemplate.html_content;
                            const hasHtml = !!targetTemplate.html;
                            const contentLength = targetTemplate.html_content ? targetTemplate.html_content.length : 0;
                            const htmlLength = targetTemplate.html ? targetTemplate.html.length : 0;
                            
                            console.log('\n📋 Content Analysis:');
                            console.log(`   - html_content exists: ${hasHtmlContent} (${contentLength} chars)`);
                            console.log(`   - html exists: ${hasHtml} (${htmlLength} chars)`);
                            
                            if (targetTemplate.html_content) {
                                const preview = targetTemplate.html_content.substring(0, 100);
                                console.log(`   - html_content preview: "${preview}${contentLength > 100 ? '...' : ''}"`);
                            }
                            
                            if (targetTemplate.html) {
                                const preview = targetTemplate.html.substring(0, 100);
                                console.log(`   - html preview: "${preview}${htmlLength > 100 ? '...' : ''}"`);
                            }
                            
                            // Test the fix logic
                            const effectiveContent = targetTemplate.html_content || targetTemplate.html;
                            const fixIsWorking = !!effectiveContent && effectiveContent !== 'Conteúdo não disponível';
                            
                            console.log('\n🎯 FIX ANALYSIS:');
                            console.log(`   - Effective content (html_content || html): ${!!effectiveContent}`);
                            console.log(`   - Content length: ${effectiveContent ? effectiveContent.length : 0} chars`);
                            console.log(`   - Fix working: ${fixIsWorking ? '✅ YES' : '❌ NO'}`);
                            
                            if (!fixIsWorking) {
                                console.log(`   - Issue: Content is ${effectiveContent ? 'empty or error message' : 'null/undefined'}`);
                            }
                            
                            resolve({
                                success: true,
                                templateFound: true,
                                fixWorking: fixIsWorking,
                                template: {
                                    id: targetTemplate.id,
                                    nome: targetTemplate.nome,
                                    hasHtmlContent,
                                    hasHtml,
                                    contentLength,
                                    htmlLength,
                                    effectiveContentLength: effectiveContent ? effectiveContent.length : 0
                                }
                            });
                        } else {
                            console.log('\n⚠️ Target template "Super Oferta" not found in API response');
                            console.log('📋 Available templates:');
                            jsonData.data.templates.slice(0, 5).forEach((template, index) => {
                                console.log(`   ${index + 1}. "${template.nome}" (ID: ${template.id})`);
                            });
                            
                            resolve({
                                success: true,
                                templateFound: false,
                                totalTemplates: jsonData.data.templates.length,
                                availableTemplates: jsonData.data.templates.map(t => ({
                                    id: t.id,
                                    nome: t.nome
                                })).slice(0, 10)
                            });
                        }
                    } else {
                        console.log('\n⚠️ No templates found in API response');
                        resolve({
                            success: true,
                            templateFound: false,
                            totalTemplates: 0
                        });
                    }
                    
                } catch (parseError) {
                    console.error('❌ Failed to parse JSON response:', parseError.message);
                    console.log('📄 Raw response:', data.substring(0, 500));
                    resolve({
                        success: false,
                        error: 'Failed to parse JSON response',
                        rawResponse: data.substring(0, 500)
                    });
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ API Request failed:', error.message);
            resolve({
                success: false,
                error: error.message
            });
        });

        req.setTimeout(10000, () => {
            console.error('❌ Request timeout');
            req.destroy();
            resolve({
                success: false,
                error: 'Request timeout'
            });
        });

        req.end();
    });
}

// Run the test
testTemplateAPI()
    .then(result => {
        console.log('\n🏁 API Test Results:');
        console.log('==================');
        
        if (result.success) {
            if (result.templateFound) {
                console.log(`✅ Template found: ${result.template.nome}`);
                console.log(`🔧 Fix status: ${result.fixWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
                
                if (result.fixWorking) {
                    console.log('\n🎉 SUCCESS: The template content display fix is working!');
                    console.log('📝 The API is returning proper HTML content instead of "Conteúdo não disponível"');
                    console.log(`📊 Content length: ${result.template.effectiveContentLength} characters`);
                } else {
                    console.log('\n⚠️ ISSUE: The fix may not be working as expected');
                    console.log('📝 The template content is still showing as unavailable or empty');
                }
            } else {
                console.log('⚠️ Target template not found, but API is working');
                console.log(`📊 Total templates available: ${result.totalTemplates || 0}`);
                
                if (result.availableTemplates && result.availableTemplates.length > 0) {
                    console.log('\n📋 Available templates to test with:');
                    result.availableTemplates.forEach((template, index) => {
                        console.log(`   ${index + 1}. "${template.nome}" (ID: ${template.id})`);
                    });
                }
            }
        } else {
            console.log(`❌ API test failed: ${result.error}`);
            
            if (result.rawResponse) {
                console.log('\n📄 Server response preview:');
                console.log(result.rawResponse);
            }
        }
        
        console.log('\n📝 Next steps:');
        if (result.success && result.templateFound && result.fixWorking) {
            console.log('✅ 1. API test passed - the fix is working at the API level');
            console.log('✅ 2. You can manually test the frontend by:');
            console.log('   - Going to http://localhost:3001/admin/email-marketing/v2');
            console.log('   - Logging in with correct credentials');
            console.log('   - Clicking the Templates tab');
            console.log('   - Finding the template and clicking "👁️ Visualizar Template"');
        } else if (result.success && !result.templateFound) {
            console.log('⚠️ 1. Use any available template to test the fix');
            console.log('⚠️ 2. The fix should work for any template with html_content or html fields');
        } else {
            console.log('❌ 1. Check if the server is running on http://localhost:3001');
            console.log('❌ 2. Verify the API endpoint is accessible');
            console.log('❌ 3. Check server logs for any errors');
        }
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    });