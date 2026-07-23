export namespace dto {
	
	export class Song {
	    id: string;
	    title: string;
	    album: string;
	    artist: string;
	    genre: string;
	    coverArt: string;
	    duration: number;
	
	    static createFrom(source: any = {}) {
	        return new Song(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.album = source["album"];
	        this.artist = source["artist"];
	        this.genre = source["genre"];
	        this.coverArt = source["coverArt"];
	        this.duration = source["duration"];
	    }
	}

}

