import React from 'react';
import { View, FlatList } from 'react-native';
import { Container, Header, Title, Left, Right, Body, Content, Text, ListItem, Thumbnail } from 'native-base';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      players: []
    }

    this.onRefresh = this.onRefresh.bind(this);
    this.getPlayers = this.getPlayers.bind(this);
  }

  componentDidMount() {
    // fetch players on mount
    this.getPlayers();
  }

  onRefresh() {
    // Show spinning wheel, then fetch players
    this.setState({
      isRefreshing: true
    }, () => {
      this.getPlayers();
    })
  }

  async getPlayers() {
    // First get data from endpoint
    let response = await fetch(`https://api.squadql.com/v1/fantasy/players?team_id=55DF10EA-F05C-4FF7-BB87-8678FC96B0DC&include=1`, {
       method: "GET",
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'X-QL-TOKEN': `f1432e0d-557d-466f-877c-8fc6631e7594 864000.DTGtAg.1zESzJ_OCDi42EXpy3HWvChP41E`
       },
    });
    // JSON body parse
    response = await response.json();

    // Get real players from fantasy-players
    let players = response.included.map((p, i) => {
      return {
        ...p,
        is_starting: response.data[i].attributes.is_starting
      }
    });

    // Set state with updated player list
    this.setState({ players, isRefreshing: false });
  }

  render() {
    return (
      <Container>
        <Header>
          <Body>
            <Title>Players</Title>
          </Body>
        </Header>
        <FlatList
          data={this.state.players}
          keyExtractor={player => player.id}
          renderItem={({item}) =>
            <ListItem>
              {(item.attributes.image_url) ?
                <Thumbnail small source={{ uri: item.attributes.image_url }} /> :
                <View style={styles.noImageBg}><Text style={styles.noImageText}>N/A</Text></View>
              }
              <Body>
                <Text style={styles.title}>{item.attributes.full_name}</Text>
                <Text style={styles.position} note>{item.attributes.position}</Text>
              </Body>
              <Right style={{minWidth: 100}}>
              {(item.is_starting) ?
                <Text style={{...styles.isStarting, ...styles.startingTheme}} note>STARTING</Text> :
                <Text style={{...styles.isStarting, ...styles.benchTheme}}note>BENCH</Text>
              }
              </Right>
            </ListItem>
          }
          onRefresh={this.onRefresh}
          refreshing={this.state.isRefreshing}
        />
      </Container>
    );
  }
}

const styles = {
  noImageBg: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center'
  },

  noImageText: {
    color: '#777',
    fontWeight: '500',
    fontSize: 15,
  },

  title: {
    fontWeight: '500',
    color: '#555'
  },

  position: {
    fontWeight: '400',
    fontStyle: 'italic'
  },

  isStarting: {
    fontWeight: '500',
    textAlign: 'right'
  },

  benchTheme: {
    color: '#e47712'
  },

  startingTheme: {
    color: `#17c994`
  },
};
