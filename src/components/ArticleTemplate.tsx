import React from 'react';
import AuthorBio from './AuthorBio';
import TrustBlock from './TrustBlock';

interface ArticleTemplateProps {
  children: React.ReactNode;
}

export default function ArticleTemplate({ children }: ArticleTemplateProps) {
  return (
    <article className="article-template">
      <div className="article-content">
        {children}
      </div>
      
      <div className="article-footer">
        <AuthorBio />
        <TrustBlock />
        
        <div className="sources-references">
          <h3>Sources & References</h3>
          <ul>
            <li>Federal Aviation Administration (faa.gov)</li>
            <li>International Air Transport Association (iata.org)</li>
            <li>Official airline and airport websites</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
