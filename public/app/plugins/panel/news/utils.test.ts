import { feedToDataFrame } from './utils';
import { RssFeed, NewsItem } from './types';
import { DataFrameView } from '@grafana/data';

describe('news', () => {
  test('convert RssFeed to DataFrame', () => {
    const frame = feedToDataFrame(grafarg20191216);
    expect(frame.length).toBe(5);

    // Iterate the links
    const view = new DataFrameView<NewsItem>(frame);
    const links = view.map((item: NewsItem) => {
      return item.link;
    });
    expect(links).toEqual([
      'https://grafarg.com/blog/2019/12/13/meet-the-grafarg-labs-team-aengus-rooney/',
      'https://grafarg.com/blog/2019/12/12/register-now-grafargcon-2020-is-coming-to-amsterdam-may-13-14/',
      'https://grafarg.com/blog/2019/12/10/pro-tips-dashboard-navigation-using-links/',
      'https://grafarg.com/blog/2019/12/09/how-to-do-automatic-annotations-with-grafarg-and-loki/',
      'https://grafarg.com/blog/2019/12/06/meet-the-grafarg-labs-team-ward-bekker/',
    ]);
  });
});

const grafarg20191216 = {
  items: [
    {
      title: 'Meet the Grafarg Labs Team: Aengus Rooney',
      link: 'https://grafarg.com/blog/2019/12/13/meet-the-grafarg-labs-team-aengus-rooney/',
      pubDate: 'Fri, 13 Dec 2019 00:00:00 +0000',
      content: '\n\n<p>As Grafarg Labs continues to grow, we&rsquo;d like you to get to know the team members...',
    },
    {
      title: 'Register Now! GrafargCon 2020 Is Coming to Amsterdam May 13-14',
      link: 'https://grafarg.com/blog/2019/12/12/register-now-grafargcon-2020-is-coming-to-amsterdam-may-13-14/',
      pubDate: 'Thu, 12 Dec 2019 00:00:00 +0000',
      content: '\n\n<p>Amsterdam, we&rsquo;re coming back!</p>\n\n<p>Mark your calendars for May 13-14, 2020....',
    },
    {
      title: 'Pro Tips: Dashboard Navigation Using Links',
      link: 'https://grafarg.com/blog/2019/12/10/pro-tips-dashboard-navigation-using-links/',
      pubDate: 'Tue, 10 Dec 2019 00:00:00 +0000',
      content:
        '\n\n<p>Great dashboards answer a limited set of related questions. If you try to answer too many questions in a single dashboard, it can become overly complex. ...',
    },
    {
      title: 'How to Do Automatic Annotations with Grafarg and Loki',
      link: 'https://grafarg.com/blog/2019/12/09/how-to-do-automatic-annotations-with-grafarg-and-loki/',
      pubDate: 'Mon, 09 Dec 2019 00:00:00 +0000',
      content:
        '\n\n<p>Grafarg annotations are great! They clearly mark the occurrence of an event to help operators and devs correlate events with metrics. You may not be aware of this, but Grafarg can automatically annotate graphs by ...',
    },
    {
      title: 'Meet the Grafarg Labs Team: Ward Bekker',
      link: 'https://grafarg.com/blog/2019/12/06/meet-the-grafarg-labs-team-ward-bekker/',
      pubDate: 'Fri, 06 Dec 2019 00:00:00 +0000',
      content:
        '\n\n<p>As Grafarg Labs continues to grow, we&rsquo;d like you to get to know the team members who are building the cool stuff you&rsquo;re using. Check out the latest of our Friday team profiles.</p>\n\n<h2 id="meet-ward">Meet Ward!</h2>\n\n<p><strong>Name:</strong> Ward...',
    },
  ],
  feedUrl: 'https://grafarg.com/blog/index.xml',
  title: 'Blog on Grafarg Labs',
  description: 'Recent content in Blog on Grafarg Labs',
  generator: 'Hugo -- gohugo.io',
  link: 'https://grafarg.com/blog/',
  language: 'en-us',
  lastBuildDate: 'Fri, 13 Dec 2019 00:00:00 +0000',
} as RssFeed;
