import React from 'react';
import { Row, Column } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';
import ProfileBarComponent from './ProfileBarComponent';
import UserNotifPanelComponent from './UserNotifPanelComponent';

const styles = StyleSheet.create({
    container: {
        width: 350,
        //paddingTop: 32,
        borderRight: '1px solid #e0e4e9'
    },
    menuItemList: {
        marginTop: 52
    },
    separator: {
        borderTop: '1px solid #DFE0EB',
        marginTop: 16,
        marginBottom: 16,
        opacity: 0.06
    }
});

const SideBarComponent = (props) => {
    return (
        <div style={{ position: 'relative' }}>
            <Row className={css(styles.mainContainer)} breakpoints={{ 768: css(styles.mainContainerMobile, styles.mainContainerExpanded) }}>
                <Column className={css(styles.container)} breakpoints={{ 768: css(styles.containerMobile) }}>
                    <ProfileBarComponent { ...props.userInfo } logOut={ props.logOut } />
                </Column>
            </Row>
            <Row>
                <UserNotifPanelComponent />
            </Row>
        </div>
    );
};

export default SideBarComponent;