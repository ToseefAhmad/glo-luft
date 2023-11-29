import './BlogPage.scss';

import React from 'react';

import {BlogPostListContainer, BlogListMetaContainer} from 'bat-core/blog';

export function BlogPage() {
    return (
        <div className="blog-page">
            <BlogListMetaContainer/>
            <BlogPostListContainer/>
        </div>
    );
}
