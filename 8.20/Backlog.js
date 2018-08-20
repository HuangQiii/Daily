import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import {
  Input, Icon, Popover, Checkbox,
} from 'choerodon-ui';
import _ from 'lodash';
import './Backlog.scss';
import '../../../../Agile.scss';
import US from '../../../../../stores/project/userMap/UserMapStore';
import TypeTag from '../../../../../components/TypeTag';

@observer
class Backlog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
    };
  }

  componentDidMount() {
    this.loadIssues();
  }

  /**
   * filter issues by keyword
   * @param {*} keyword user input
   * @param {*} issues issues filter after fast search
   */
  getIssuesByKeyword(keyword, issues) {
    if (!keyword) return issues;
    return issues.filter(issue => issue.issueNum.indexOf(keyword) !== -1
      || issue.summary.indexOf(keyword) !== -1);
  }

  handleChangeInput = (e) => {
    this.setState({ keyword: e.target.value });
  };

  loadIssues() {
    US.loadBacklogIssues();
  }

  handleClickExpand(id) {
    const expand = US.backlogExpand.slice();
    const index = expand.findIndex(v => v === id);
    if (index === -1) {
      expand.push(id);
    } else {
      expand.splice(index, 1);
    }
    US.setBacklogExpand(expand);
  }

  handleClickFilter(id) {
    const currentBacklogFilters = US.currentBacklogFilters.slice();
    const index = currentBacklogFilters.findIndex(v => v === id);
    if (index === -1) {
      currentBacklogFilters.push(id);
    } else {
      currentBacklogFilters.splice(index, 1);
    }
    US.setCurrentBacklogFilter(currentBacklogFilters);
    US.loadBacklogIssues();
  }

  /**
   * load issues,
   * 1. mode none then render issue list 
   * 2. mode not none render issue group, sprint||version
   */
  renderIssues() {
    const { mode, backlogExpand } = US;
    const { keyword } = this.state;
    let group = [];
    if (mode === 'none') {
      group = this.getIssuesByKeyword(keyword, US.backlogIssues);
      return (
        <div className="issues">
          <div>
            <div className="title">
              <h4 className="word">Issues</h4>
              <Icon
                type={backlogExpand.includes(0) ? 'expand_less' : 'expand_more'}
                onClick={this.handleClickExpand.bind(this, 0)}
              />
            </div>
            {backlogExpand.includes(0) ? null : (
              <ul className="issue-block">
                {
                  _.map(group, issue => this.renderIssue(issue))
                }
              </ul>
            )}
          </div>
        </div>
      );
    } else {
      group = US[`${mode}s`];
      return (
        <div className="issues">
          {_.map(group, (v, i) => this.renderGroupIssue(v, i))}
          {this.renderUnscheduledIssue()}
        </div>
      );
    }
  }

  /**
   * render issue group, container title and filter by sprint||version issues, and unschedule issues
   * @param {*} group sprint or version array
   * @param {*} i index 
   */
  renderGroupIssue(group, i) {
    const { mode, backlogExpand } = US;
    const { keyword } = this.state;
    const issues = this.getIssuesByKeyword(keyword, US.backlogIssues.filter(v => v[`${mode}Id`] === group[`${mode}Id`]));
    return (
      <div key={i}>
        <div className="title">
          <h4 className="word text-overflow-hidden">
            {group.name || group.sprintName}
          </h4>
          <Icon
            type={backlogExpand.includes(group[`${mode}Id`]) ? 'expand_less' : 'expand_more'}
            onClick={this.handleClickExpand.bind(this, group[`${mode}Id`])}
          />
        </div>
        {backlogExpand.includes(group[`${mode}Id`]) ? null : (
          <ul className="issue-block">
            {
              _.map(issues, issue => this.renderIssue(issue))
            }
          </ul>
        )}
      </div>
    );
  }

  renderUnscheduledIssue() {
    const { mode, backlogExpand } = US;
    const { keyword } = this.state;
    const issues = this.getIssuesByKeyword(keyword, US.backlogIssues.filter(v => v[`${mode}Id`] === null));
    return (
      <div>
        <div className="title">
          <h4 className="word">
            {'Unscheduled'}
          </h4>
          <Icon
            type={backlogExpand.includes('Unscheduled') ? 'expand_less' : 'expand_more'}
            onClick={this.handleClickExpand.bind(this, 'Unscheduled')}
          />
        </div>
        {backlogExpand.includes('Unscheduled') ? null : (
          <ul className="issue-block">
            {
              _.map(issues, issue => this.renderIssue(issue))
            }
          </ul>
        )}
      </div>
    );
  }

  renderIssue(issue) {
    return (
      <li
        key={issue.issueId}
        className="issue"
        style={{
          background: issue.statusCode === 'done' ? 'rgba(0, 0, 0, 0.06)' : '#fff',
        }}
      >
        <span className="type">
          <TypeTag typeCode={issue.typeCode} />
        </span>
        <span className="summary text-overflow-hidden">
          {issue.summary}
        </span>
        <span
          className="issueNum"
          style={{
            textDecoration: issue.statusCode === 'done' ? 'line-through' : 'unset',
          }}
        >
          {issue.issueNum}
        </span>
      </li>
    );
  }

  render() {
    return (
      <div className="c7n-userMap-backlog agile">
        <div className="header">
          <div className="input">
            <Input
              placeholder="按照名称搜索"
              prefix={<Icon type="search" />}
              label=""
              onChange={this.handleChangeInput}
            />
          </div>
          <Popover
            trigger="click"
            placement="bottomRight"
            overlayClassName="c7n-backlog-popover"
            content={(
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {
                  [
                    {
                      name: '仅我的问题',
                      id: 'mine',
                    },
                    {
                      name: '仅用户故事',
                      id: 'story',
                    },
                  ].map(items => (
                    <Checkbox
                      onChange={this.handleClickFilter.bind(this, items.id)}
                      checked={US.currentBacklogFilters.includes(items.id)}
                    >
                      {items.name}
                    </Checkbox>
                  ))
                }
                {
                  US.filters.map(filter => (
                    <Checkbox
                      onChange={this.handleClickFilter.bind(this, filter.filterId)}
                      checked={US.currentBacklogFilters.includes(filter.filterId)}
                    >
                      {filter.name}
                    </Checkbox>
                  ))
                }
              </div>
            )}
          >
            <div className="btn">
              <span>快速搜索</span>
              <Icon type="baseline-arrow_drop_down" className="icon" />
            </div>
          </Popover>
        </div>
        <div className="body">
          {this.renderIssues()}
        </div>
      </div>
    );
  }
}

export default withRouter(Backlog);
