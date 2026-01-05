import React from 'react';
import Link from 'next/link';

export default function AuthorBio() {
  return (
    <div className="author-bio">
      <h3 className="author-name">Fly2Any Editorial Team</h3>
      <p className="author-bio-text">
        Content reviewed and published by the Fly2Any Editorial Team, a US-based travel technology company specializing in flight search, pricing intelligence, and global route analysis.
      </p>
      <div className="author-links">
        <Link href="/about" className="author-link">About Fly2Any</Link>
        <span className="separator"> | </span>
        <Link href="/editorial-policy" className="author-link">Editorial Policy</Link>
      </div>
    </div>
  );
}
