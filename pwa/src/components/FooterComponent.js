import React from 'react';
import { Row } from 'simple-flexbox';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
    container: {
        height: 40,
        // backgroundColor: '#03fcf4',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        left: 0
        //boxSizing: 'border-box'  
    },
    title: {
        fontFamily: 'arial',
        fontStyle: 'normal',
        fontWeight: 'bolder',
        fontSize: 18,
        lineHeight: '30px',
        letterSpacing: 0.3,
        display: 'table',
        margin: 'auto',
        color: '#ff596a',
        // '@media (max-width: 768px)': {
        //     marginLeft: 36
        // },
        // '@media (max-width: 468px)': {
        //     fontSize: 10
        // }
    },
});

const FooterComponent = () => {
    return (
        <Row className={css(styles.container)} vertical="center" horizontal="space-between">
            <span className={css(styles.title)}>Matcha &copy; { new Date().getFullYear() }</span>
        </Row>
    );
};

export default FooterComponent;