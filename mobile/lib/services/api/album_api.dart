import '../api_client.dart';

class AlbumPhoto {
  final String id;
  final String petId;
  final String imageUrl;
  final String? thumbnailUrl;
  final String? description;
  final DateTime? takenDate;
  final DateTime createdAt;

  AlbumPhoto({
    required this.id,
    required this.petId,
    required this.imageUrl,
    this.thumbnailUrl,
    this.description,
    this.takenDate,
    required this.createdAt,
  });

  factory AlbumPhoto.fromJson(Map<String, dynamic> json) {
    return AlbumPhoto(
      id: json['id'] as String,
      petId: json['petId'] as String,
      imageUrl: json['imageUrl'] as String,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      description: json['description'] as String?,
      takenDate: json['takenDate'] != null ? DateTime.parse(json['takenDate'] as String) : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class AlbumApi {
  final ApiClient _client;
  AlbumApi(this._client);

  Future<List<AlbumPhoto>> getPhotos(String petId, {int page = 1, int size = 20}) async {
    final res = await _client.get('/pets/$petId/album', query: {'page': '$page', 'size': '$size'});
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => AlbumPhoto.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<AlbumPhoto> uploadPhoto(String petId, String filePath, {String? description}) async {
    final fields = <String, String>{};
    if (description != null) fields['description'] = description;
    final res = await _client.upload('/pets/$petId/album', 'image', filePath, fields: fields);
    return AlbumPhoto.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deletePhoto(String id) async {
    await _client.delete('/album/$id');
  }
}
